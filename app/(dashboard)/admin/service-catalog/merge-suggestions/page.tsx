import { auth } from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";


export default async function MergeSuggestionsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }

  if (session.user.role !== "admin") {
    return redirect('/dashboard')
  }

  debugger;

}