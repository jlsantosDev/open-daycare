import { LoginPanel } from "@/components/LoginPanel/LoginPanel";
import { LoginForm } from "@/components/LoginForm/LoginForm";

/** Login standalone (sin AppShell): panel corporativo + formulario, grid del mockup. */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FBF4EC] md:grid md:grid-cols-[1.05fr_1fr]">
      <LoginPanel />
      <div className="flex items-center justify-center p-10">
        <LoginForm />
      </div>
    </div>
  );
}
