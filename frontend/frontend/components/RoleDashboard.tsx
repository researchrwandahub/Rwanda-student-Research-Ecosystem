import AdminDashboard from "./Dashboards/AdminDashboard";
import AuthorDashboard from "./Dashboards/AuthorDashboard";
import ReviewerDashboard from "./Dashboards/ReviewerDashboard";
import EditorialDashboard from "./Dashboards/EditorialDashboard";

interface RoleDashboardProps {
  role: string;
}

export default function RoleDashboard({ role }: RoleDashboardProps) {
  switch (role) {
    case "administrator":
      return <AdminDashboard />;

    case "author":
      return <AuthorDashboard />;

    case "reviewer":
      return <ReviewerDashboard />;

    case "editor":
      return <EditorialDashboard role="editor" />;

    case "editor_in_chief":
      return <EditorialDashboard role="editor_in_chief" />;

    default:
      return (
        <div className="p-10 text-center">
          <h2 className="text-xl font-semibold">No dashboard available</h2>
          <p className="text-gray-500 mt-2">
            Your account role does not have an assigned dashboard.
          </p>
        </div>
      );
  }
}
