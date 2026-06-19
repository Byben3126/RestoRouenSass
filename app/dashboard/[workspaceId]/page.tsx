import { redirect } from "next/navigation";

export default function DashboardPage({ params }: { params: { workspaceId: string } }) {
  redirect(`/dashboard/${params.workspaceId}/home`);
}