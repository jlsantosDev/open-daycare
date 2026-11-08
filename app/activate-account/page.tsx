import { ActivateForm } from "@/components/ActivateForm/ActivateForm";
import { kids } from "@/data/kids";

// La invitación del mockup es para Mateo (SPEC 02: mismo niño que el perfil)
const invitedKid = kids.find((kid) => kid.id === "mateo-fernandez")!;

/** Activar cuenta standalone (sin AppShell): tarjeta centrada con la invitación. */
export default function ActivateAccountPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF4EC] p-10">
      <ActivateForm kid={invitedKid} />
    </div>
  );
}
