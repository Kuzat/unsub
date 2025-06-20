import Enable2FA from "@/components/auth/enable-2fa";
import {requireSession} from "@/lib/auth";

export default async function Enable2FAPage() {
  const session = await requireSession();


  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-2xl font-bold">Enable Two Factor Authentication</h1>
        <p className="">
          Since you are have the <span className="bg-primary p-1 rounded-md">{session.user.role}</span> role you must enable two factor authentication to continue.
        </p>
        <Enable2FA />
      </div>
    </div>
  );
}