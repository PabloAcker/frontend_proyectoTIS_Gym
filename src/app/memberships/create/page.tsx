// src/app/memberships/create/page.tsx
import { CreateMembershipForm } from "@/components/CreateMembershipForm";

export default function CreateMembershipPage() {
  return (
    <main className="p-6 bg-background text-foreground min-h-screen">
      <CreateMembershipForm />
    </main>
  );
}