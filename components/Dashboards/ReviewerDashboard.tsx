import { useEffect, useState } from "react";
import DashboardLayout from "../DashboardLayout";
import api, { absoluteUrl } from "../../utils/api";

interface Assignment {
  id: number;
  article: number;
  article_title: string;
  article_author: string;
  article_status: string;
  pdf: string;
  assigned_at: string;
  completed: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

export default function ReviewerDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [
        assignmentsResponse,
        notificationsResponse
      ] = await Promise.all([
        api.get("/assignments/my/"),
        api.get("/notifications/")
      ]);

      setAssignments(
        assignmentsResponse.data.results ||
        assignmentsResponse.data
      );

      setNotifications(
        notificationsResponse.data.results ||
        notificationsResponse.data
      );

    } catch (error) {
      console.log(
        "Reviewer dashboard error",
        error
      );

    } finally {
      setLoading(false);
    }
  }


  if (loading) {
    return (
      <DashboardLayout
        role="reviewer"
        title="Reviewer Dashboard"
      >
        <div className="p-10">
          Loading reviewer dashboard...
        </div>
      </DashboardLayout>
    );
  }


  const pending =
    assignments.filter(
      (item) => !item.completed
    ).length;


  const completed =
    assignments.filter(
      (item) => item.completed
    ).length;



  return (
    <DashboardLayout
      role="reviewer"
      title="Reviewer Dashboard"
    >

      {/* STATISTICS */}

      <div className="grid md:grid-cols-3 gap-5 mb-8">

        <div className="border rounded-xl p-5">
          <h3 className="font-semibold">
            Assigned Reviews
          </h3>
          <p className="text-3xl">
            {assignments.length}
          </p>
        </div>


        <div className="border rounded-xl p-5">
          <h3 className="font-semibold">
            Pending
          </h3>
          <p className="text-3xl">
            {pending}
          </p>
        </div>


        <div className="border rounded-xl p-5">
          <h3 className="font-semibold">
            Completed
          </h3>
          <p className="text-3xl">
            {completed}
          </p>
        </div>

      </div>



      {/* ASSIGNED MANUSCRIPTS */}

      <h2 className="text-2xl font-bold mb-5">
        Assigned Manuscripts
      </h2>


      {
        assignments.length === 0 ? (

          <p>
            No manuscripts assigned yet.
          </p>

        ) : (

          assignments.map((item) => (

            <div
              key={item.id}
              className="
                border
                rounded-xl
                p-5
                mb-5
              "
            >

              <h3 className="text-xl font-semibold">
                {item.article_title}
              </h3>


              <p>
                Author: {item.article_author}
              </p>


              <p>
                Status: {item.article_status}
              </p>


              <p>
                Assigned:{" "}
                {
                  new Date(
                    item.assigned_at
                  ).toLocaleDateString()
                }
              </p>



              <div className="flex gap-4 mt-5">


                {/* DOWNLOAD PDF */}

                <a
                  href={absoluteUrl(item.pdf)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    bg-blue-700
                    text-white
                    px-5
                    py-2
                    rounded-xl
                  "
                >
                  Download PDF
                </a>



                {/* REVIEW PAGE */}

                <a
                  href={`/dashboard/reviewer/review/${item.id}`}
                  className="
                    bg-green-700
                    text-white
                    px-5
                    py-2
                    rounded-xl
                  "
                >
                  Review Manuscript
                </a>


              </div>


            </div>

          ))

        )
      }





      {/* NOTIFICATIONS */}

      <h2 className="text-2xl font-bold mt-10 mb-5">
        Notifications
      </h2>


      {
        notifications.length === 0 ? (

          <p>
            No notifications.
          </p>

        ) : (

          notifications.map((note) => (

            <div
              key={note.id}
              className="
                border-b
                py-4
              "
            >

              <h3 className="font-semibold">
                {note.title}
              </h3>


              <p>
                {note.message}
              </p>


            </div>

          ))

        )
      }


    </DashboardLayout>
  );
}