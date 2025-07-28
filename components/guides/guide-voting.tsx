"use client"

import {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {ThumbsUp, ThumbsDown} from "lucide-react"
import {voteOnGuide, getGuideVoteStats, getUserVote} from "@/app/actions/guide-votes"
import {toast} from "sonner"

interface GuideVotingProps {
  guideId: string
}

export default function GuideVoting({guideId}: GuideVotingProps) {
  const [userVote, setUserVote] = useState<{isHelpful: boolean} | null>(null)
  const [stats, setStats] = useState({helpful: 0, notHelpful: 0, total: 0})
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    async function loadVotingData() {
      try {
        const [userVoteData, statsData] = await Promise.all([
          getUserVote(guideId),
          getGuideVoteStats(guideId)
        ])
        
        setUserVote(userVoteData)
        setStats(statsData)
      } catch (error) {
        console.error("Error loading voting data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVotingData()
  }, [guideId])

  const handleVote = async (isHelpful: boolean) => {
    setIsVoting(true)
    
    try {
      const result = await voteOnGuide(guideId, isHelpful)
      
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      
      // Update local state
      const wasNewVote = !userVote
      const wasChangingVote = userVote && userVote.isHelpful !== isHelpful
      
      setUserVote({isHelpful})
      
      // Update stats optimistically
      setStats(prev => {
        if (wasNewVote) {
          return {
            ...prev,
            helpful: prev.helpful + (isHelpful ? 1 : 0),
            notHelpful: prev.notHelpful + (!isHelpful ? 1 : 0),
            total: prev.total + 1
          }
        } else if (wasChangingVote) {
          return {
            ...prev,
            helpful: prev.helpful + (isHelpful ? 1 : -1),
            notHelpful: prev.notHelpful + (!isHelpful ? 1 : -1)
          }
        }
        return prev
      })
      
      toast.success("Thank you for your feedback!")
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("Failed to submit vote")
    } finally {
      setIsVoting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">Was this guide helpful?</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <ThumbsUp className="mr-2 h-4 w-4" />
            Yes
          </Button>
          <Button variant="outline" size="sm" disabled>
            <ThumbsDown className="mr-2 h-4 w-4" />
            No
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">Was this guide helpful?</p>
        <div className="flex gap-2">
          <Button
            variant={userVote?.isHelpful === true ? "default" : "outline"}
            size="sm"
            onClick={() => handleVote(true)}
            disabled={isVoting}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Yes
          </Button>
          <Button
            variant={userVote?.isHelpful === false ? "default" : "outline"}
            size="sm"
            onClick={() => handleVote(false)}
            disabled={isVoting}
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            No
          </Button>
        </div>
      </div>
      
      {stats.total > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {stats.helpful} of {stats.total} people found this helpful
        </div>
      )}
    </div>
  )
}