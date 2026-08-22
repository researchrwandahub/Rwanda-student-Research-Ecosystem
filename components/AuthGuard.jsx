import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AuthGuard({
  children,
}) {
  const router = useRouter();

  const [checking, setChecking] =
    useState(true);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const token =
      localStorage.getItem(
        "rmsjToken"
      );

    /*
     * No token = not authenticated.
     */
    if (!token) {
      router.replace("/");

      return;
    }

    setChecking(false);

    /*
     * Intercept browser Back.
     */
    const handlePopState = () => {
      const confirmed =
        window.confirm(
          "Are you sure you want to log out?"
        );

      if (confirmed) {
        localStorage.removeItem(
          "rmsjToken"
        );

        localStorage.removeItem(
          "rmsjRefresh"
        );

        localStorage.removeItem(
          "rmsjRole"
        );

        localStorage.removeItem(
          "rmsjUsername"
        );

        localStorage.removeItem(
          "rmsjFullName"
        );

        localStorage.removeItem(
          "rmsjUser"
        );

        router.replace("/");

      } else {
        /*
         * Keep the user on the dashboard.
         */
        router.push(
          router.asPath
        );
      }
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };

  }, [router.isReady]);

  if (checking) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <div className="
            text-blue-700
            font-semibold
          ">
            Loading RSJH...
          </div>
        </div>
      </div>
    );
  }

  return children;
}