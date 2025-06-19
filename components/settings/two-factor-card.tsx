"use client"
import {authClient} from "@/lib/client";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {TwoFactorForm} from "@/components/auth/two-factor-form";

export function TwoFactorCard() {
  const {refetch} = authClient.useSession();

  const HandleCompletedTwoFactor = async () => {
    refetch();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Manage your account security settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TwoFactorForm onCompleted={HandleCompletedTwoFactor}/>
      </CardContent>
    </Card>
  )
}