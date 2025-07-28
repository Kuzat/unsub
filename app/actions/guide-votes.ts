"use server"

import {requireSession} from "@/lib/auth"
import {db} from "@/db"
import {guideVote, guide} from "@/db/schema/app"
import {eq, and, count, sql} from "drizzle-orm"
import crypto from "crypto"

export async function voteOnGuide(guideId: string, isHelpful: boolean) {
  const session = await requireSession()
  
  try {
    // Check if guide exists
    const guideExists = await db.query.guide.findFirst({
      where: eq(guide.id, guideId)
    })
    
    if (!guideExists) {
      return {error: "Guide not found"}
    }
    
    // Check if user already voted
    const existingVote = await db.query.guideVote.findFirst({
      where: and(
        eq(guideVote.guideId, guideId),
        eq(guideVote.userId, session.user.id)
      )
    })
    
    if (existingVote) {
      // Update existing vote
      await db.update(guideVote)
        .set({
          isHelpful,
          updatedAt: new Date()
        })
        .where(eq(guideVote.id, existingVote.id))
    } else {
      // Create new vote
      await db.insert(guideVote).values({
        id: crypto.randomUUID(),
        guideId,
        userId: session.user.id,
        isHelpful,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    
    return {success: true}
  } catch (error) {
    console.error("Error voting on guide:", error)
    return {error: "Failed to submit vote"}
  }
}

export async function getGuideVoteStats(guideId: string) {
  try {
    const result = await db
      .select({
        helpful: sql<number>`count(*) filter (where ${guideVote.isHelpful} = true)`,
        notHelpful: sql<number>`count(*) filter (where ${guideVote.isHelpful} = false)`,
        total: count()
      })
      .from(guideVote)
      .where(eq(guideVote.guideId, guideId))
    
    return {
      helpful: Number(result[0]?.helpful || 0),
      notHelpful: Number(result[0]?.notHelpful || 0),
      total: Number(result[0]?.total || 0)
    }
  } catch (error) {
    console.error("Error getting vote stats:", error)
    return {helpful: 0, notHelpful: 0, total: 0}
  }
}

export async function getUserVote(guideId: string) {
  const session = await requireSession()
  
  try {
    const vote = await db.query.guideVote.findFirst({
      where: and(
        eq(guideVote.guideId, guideId),
        eq(guideVote.userId, session.user.id)
      )
    })
    
    return vote ? {isHelpful: vote.isHelpful} : null
  } catch (error) {
    console.error("Error getting user vote:", error)
    return null
  }
}