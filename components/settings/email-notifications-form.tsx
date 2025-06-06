"use client"

import {useState} from "react"
import {toast} from "sonner"
import {useRouter} from "next/navigation"
import {Switch} from "@/components/ui/switch"
import {updateEmailNotifications} from "@/app/actions/user-settings"

interface EmailNotificationsFormProps {
  receiveEmails: boolean
  sendRenewalReminderEmails?: boolean
}

export function EmailNotificationsForm({
                                         receiveEmails: initialReceiveEmails,
                                         sendRenewalReminderEmails: initialSendRenewalReminderEmails = true
                                       }: EmailNotificationsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [receiveEmails, setReceiveEmails] = useState(initialReceiveEmails)
  const [sendRenewalReminderEmails, setSendRenewalReminderEmails] = useState(initialSendRenewalReminderEmails)
  const router = useRouter()

  const handleGeneralToggleChange = async (checked: boolean) => {
    setIsLoading(true)
    setReceiveEmails(checked)

    try {
      const result = await updateEmailNotifications({
        receiveEmails: checked,
        sendRenewalReminderEmails: sendRenewalReminderEmails
      });

      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        // Revert the toggle if there was an error
        setReceiveEmails(!checked)
        toast.error(result.message)
      }
    } catch (error) {
      // Revert the toggle if there was an error
      setReceiveEmails(!checked)
      toast.error(`An error occurred while updating your notification preferences: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRenewalReminderToggleChange = async (checked: boolean) => {
    setIsLoading(true)
    setSendRenewalReminderEmails(checked)

    try {
      const result = await updateEmailNotifications({
        receiveEmails,
        sendRenewalReminderEmails: checked
      })

      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        // Revert the toggle if there was an error
        setSendRenewalReminderEmails(!checked)
        toast.error(result.message)
      }
    } catch (error) {
      // Revert the toggle if there was an error
      setSendRenewalReminderEmails(!checked)
      toast.error(`An error occurred while updating your notification preferences: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Email Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Control whether you receive email notifications from the application.
        </p>
      </div>

      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Enable Email Notifications</label>
          <p className="text-sm text-muted-foreground">
            When enabled, you will receive email notifications for important events.
          </p>
        </div>
        <Switch
          checked={receiveEmails}
          onCheckedChange={handleGeneralToggleChange}
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Receive Subscription Renewal Reminders via Email</label>
          <p className="text-sm text-muted-foreground">
            When enabled, you will receive email reminders before your subscriptions renew.
          </p>
        </div>
        <Switch
          checked={sendRenewalReminderEmails}
          onCheckedChange={handleRenewalReminderToggleChange}
          disabled={isLoading || !receiveEmails}
        />
      </div>
    </div>
  )
}
