
import { useEffect, useState } from "react";
import api, { absoluteUrl } from "../utils/api";

interface ProfileData {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  other_names?: string;
  last_name?: string;
  full_name?: string;
  role?: string;
  account_status?: string;
  institution?: string;
  university?: string;
  department?: string;
  country?: string;
  discipline?: string;
  academic_stage?: string;
  orcid?: string;
  biography?: string;
  research_interests?: string;
  profile_picture?: string | null;
  academic_position?: string;
  research_field?: string;
  research_experience?: string;
  publications_count?: number;
  is_verified_researcher?: boolean;
}

interface ProfileForm {
  first_name: string;
  other_names: string;
  last_name: string;
  university: string;
  department: string;
  institution: string;
  country: string;
  discipline: string;
  academic_stage: string;
  orcid: string;
  biography: string;
  research_interests: string;
}

export default function Profile() {
  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [preview, setPreview] =
    useState("");

  const [form, setForm] =
    useState<ProfileForm>({
      first_name: "",
      other_names: "",
      last_name: "",
      university: "",
      department: "",
      institution: "",
      country: "",
      discipline: "medicine",
      academic_stage: "undergraduate",
      orcid: "",
      biography: "",
      research_interests: "",
    });

  /*
   * =========================================================
   * LOAD PROFILE
   * =========================================================
   */

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response =
        await api.get("/profile/");

      const data: ProfileData =
        response.data;

      setProfile(data);

      setForm({
        first_name: data.first_name || "",
        other_names: data.other_names || "",
        last_name: data.last_name || "",

        university:
          data.university || "",

        department:
          data.department || "",

        institution:
          data.institution || "",

        country:
          data.country || "",

        discipline:
          data.discipline || "medicine",

        academic_stage:
          data.academic_stage || "undergraduate",

        orcid:
          data.orcid || "",

        biography:
          data.biography || "",

        research_interests:
          data.research_interests || "",
      });

      /*
       * Convert Django media URL into
       * a usable frontend image URL.
       */

      if (data.profile_picture) {
        setPreview(
          absoluteUrl(
            data.profile_picture
          )
        );
      }

    } catch (error: any) {

      console.error(
        "Profile loading error:",
        error.response?.data || error
      );

      setErrorMessage(
        error.response?.data?.detail ||
        "Unable to load your profile."
      );

    } finally {

      setLoading(false);

    }
  }

  /*
   * =========================================================
   * FORM CHANGE
   * =========================================================
   */

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /*
   * =========================================================
   * SAVE PROFILE INFORMATION
   * =========================================================
   */

  async function saveProfile() {
    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const response =
        await api.patch(
          "/profile/",
          form
        );

      const data: ProfileData =
        response.data;

      setProfile(data);

      setForm({
        first_name: data.first_name || "",
        other_names: data.other_names || "",
        last_name: data.last_name || "",

        university:
          data.university || "",

        department:
          data.department || "",

        institution:
          data.institution || "",

        country:
          data.country || "",

        discipline:
          data.discipline || "medicine",

        academic_stage:
          data.academic_stage || "undergraduate",

        orcid:
          data.orcid || "",

        biography:
          data.biography || "",

        research_interests:
          data.research_interests || "",
      });

      setEditing(false);

      setMessage(
        "Profile updated successfully."
      );

    } catch (error: any) {

      console.error(
        "Profile update error:",
        error.response?.data || error
      );

      setErrorMessage(
        error.response?.data?.detail ||
        "Failed to update profile."
      );

    } finally {

      setSaving(false);

    }
  }

  /*
   * =========================================================
   * UPLOAD PROFILE PICTURE
   * =========================================================
   */

  async function uploadPicture(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Check image type
     */

    if (!file.type.startsWith("image/")) {

      setErrorMessage(
        "Please select a valid image file."
      );

      e.target.value = "";

      return;
    }

    /*
     * Maximum 5 MB
     */

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      setErrorMessage(
        "Profile picture must be smaller than 5 MB."
      );

      e.target.value = "";

      return;
    }

    /*
     * Clear previous messages
     */

    setMessage("");
    setErrorMessage("");

    /*
     * Show image immediately
     */

    const previewUrl =
      URL.createObjectURL(file);

    setPreview(previewUrl);

    /*
     * Prepare multipart form
     */

    const data =
      new FormData();

    data.append(
      "profile_picture",
      file
    );

    try {

      setUploading(true);

      /*
       * IMPORTANT:
       *
       * Do NOT manually set
       * Content-Type here.
       *
       * Axios/browser will automatically
       * create the correct multipart boundary.
       */

      const response =
        await api.patch(
          "/profile/",
          data
        );

      console.log(
        "Profile picture response:",
        response.data
      );

      const updatedProfile:
        ProfileData =
        response.data;

      setProfile(
        updatedProfile
      );

      /*
       * Use the URL returned by Django
       */

      if (
        updatedProfile.profile_picture
      ) {

        setPreview(
          absoluteUrl(
            updatedProfile.profile_picture
          )
        );

      }

      setMessage(
        "Profile picture updated successfully."
      );

    } catch (error: any) {

      console.error(
        "Profile picture upload error:",
        error.response?.data || error
      );

      /*
       * Restore previous image if upload failed
       */

      if (
        profile?.profile_picture
      ) {

        setPreview(
          absoluteUrl(
            profile.profile_picture
          )
        );

      } else {

        setPreview("");

      }

      setErrorMessage(
        error.response?.data?.profile_picture?.[0] ||
        error.response?.data?.detail ||
        "Image upload failed."
      );

    } finally {

      setUploading(false);

      /*
       * Allows user to select the
       * same image again.
       */

      e.target.value = "";
    }
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin mx-auto mb-5" />

          <h2 className="text-xl font-semibold text-gray-700">
            Loading profile...
          </h2>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * PROFILE FAILED
   * =========================================================
   */

  if (!profile) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

          <h2 className="text-xl font-semibold text-red-600">
            Unable to load profile.
          </h2>

          {errorMessage && (
            <p className="mt-3 text-gray-600">
              {errorMessage}
            </p>
          )}

          <button
            onClick={loadProfile}
            className="mt-5 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  /*
   * =========================================================
   * PROFILE PAGE
   * =========================================================
   */

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100 py-10">

      <div className="max-w-6xl mx-auto px-6">

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* =================================================
              PROFILE HEADER
              ================================================= */}

          <div className="h-56 bg-gradient-to-r from-blue-800 via-blue-600 to-green-600 relative">

            <div className="absolute -bottom-20 left-10">

              <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">

                {preview ? (

                  <img
                    src={preview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />

                ) : profile.profile_picture ? (

                  <img
                    src={absoluteUrl(
                      profile.profile_picture
                    )}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-blue-700">

                    {profile.username
                      ?.charAt(0)
                      ?.toUpperCase()}

                  </div>

                )}

              </div>

            </div>

          </div>

          {/* =================================================
              PROFILE CONTENT
              ================================================= */}

          <div className="pt-24 px-10 pb-10">

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">

              <div>

                <h1 className="text-4xl font-bold text-gray-800">

                  {profile.full_name ||
                    profile.username}

                </h1>

                <p className="text-lg text-gray-500 mt-2">
                  Medical Researcher
                </p>

                <p className="text-sm text-blue-700 mt-2 font-semibold">

                  {profile.role}

                </p>

                {profile.email && (

                  <p className="text-sm text-gray-500 mt-1">

                    {profile.email}

                  </p>

                )}

              </div>

              {/* =================================================
                  UPLOAD PHOTO
                  ================================================= */}

              <div>

                <label
                  className={`cursor-pointer inline-flex items-center justify-center ${
                    uploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-700 hover:bg-blue-800"
                  } text-white px-5 py-3 rounded-xl transition`}
                >

                  {uploading
                    ? "Uploading..."
                    : "Upload Photo"}

                  <input
                    type="file"
                    hidden
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={uploadPicture}
                    disabled={uploading}
                  />

                </label>

              </div>

            </div>

            {/* =================================================
                SUCCESS MESSAGE
                ================================================= */}

            {message && (

              <div className="mt-6 bg-green-100 border border-green-200 text-green-700 p-4 rounded-xl">

                {message}

              </div>

            )}

            {/* =================================================
                ERROR MESSAGE
                ================================================= */}

            {errorMessage && (

              <div className="mt-6 bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl">

                {errorMessage}

              </div>

            )}

            {/* =================================================
                INFORMATION GRID
                ================================================= */}

            <div className="grid lg:grid-cols-2 gap-8 mt-10">

              {/* =================================================
                  PERSONAL INFORMATION
                  ================================================= */}

              <div className="bg-blue-50 rounded-2xl p-6 shadow">

                <h2 className="text-2xl font-semibold text-blue-700 mb-5">

                  Personal Information

                </h2>

                <div className="space-y-4">

                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Official First Name"
                    aria-label="Official First Name"
                    className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                  />

                  <input
                    name="other_names"
                    value={form.other_names}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Other Name(s)"
                    aria-label="Other Name(s)"
                    className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                  />

                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Last Name"
                    aria-label="Last Name"
                    className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                  />

                  <input
                    name="university"
                    value={form.university}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="University"
                    className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                  />

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Department"
                    className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                  />

                  <input
                    name="institution"
                    value={form.institution}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Institution"
                    className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                  />

                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="Country"
                    className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                  />

                  <select
                    name="discipline"
                    value={form.discipline}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                  >
                    <option value="medicine">Medicine</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="dentistry">Dentistry / Dental Surgery</option>
                    <option value="nursing">Nursing</option>
                    <option value="public_health">Public Health</option>
                    <option value="clinical_psychology">Clinical Psychology</option>
                    <option value="biomedical_sciences">Biomedical Sciences</option>
                    <option value="health_informatics">Health Informatics</option>
                    <option value="health_communication">Health Communication & Journalism</option>
                  </select>

                  <select
                    name="academic_stage"
                    value={form.academic_stage}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                  >
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="early_career">Early-career researcher</option>
                    <option value="faculty">Faculty / Supervisor</option>
                    <option value="professional">Health professional</option>
                  </select>

                  <input
                    name="orcid"
                    value={form.orcid}
                    onChange={handleChange}
                    disabled={!editing}
                    placeholder="ORCID"
                    className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                  />

                </div>

              </div>

              {/* =================================================
                  RESEARCH PROFILE
                  ================================================= */}

              <div className="bg-green-50 rounded-2xl p-6 shadow">

                <h2 className="text-2xl font-semibold text-green-700 mb-5">

                  Research Profile

                </h2>

                <textarea
                  rows={6}
                  name="research_interests"
                  value={
                    form.research_interests
                  }
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Research interests..."
                  className="w-full border rounded-xl p-3 disabled:bg-gray-100"
                />

                <textarea
                  rows={8}
                  name="biography"
                  value={form.biography}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Biography..."
                  className="w-full border rounded-xl p-3 mt-5 disabled:bg-gray-100"
                />

              </div>

            </div>

            {/* =================================================
                RESEARCHER INFORMATION
                ================================================= */}

            <div className="grid md:grid-cols-3 gap-6 mt-8">

              <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-gray-500">
                  Research Field
                </p>

                <p className="font-semibold text-gray-800 mt-1">

                  {profile.research_field ||
                    "Not specified"}

                </p>

              </div>

              <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-gray-500">
                  Academic Position
                </p>

                <p className="font-semibold text-gray-800 mt-1">

                  {profile.academic_position ||
                    "Not specified"}

                </p>

              </div>

              <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-gray-500">
                  Publications
                </p>

                <p className="font-semibold text-gray-800 mt-1">

                  {profile.publications_count ??
                    0}

                </p>

              </div>

            </div>

            {/* =================================================
                ACTION BUTTONS
                ================================================= */}

            <div className="flex flex-wrap gap-4 mt-10">

              {editing ? (

                <>

                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl shadow"
                  >

                    {saving
                      ? "Saving..."
                      : "Save Changes"}

                  </button>

                  <button
                    onClick={() => {
                      setEditing(false);
                      setMessage("");
                      setErrorMessage("");

                      /*
                       * Restore original
                       * profile values.
                       */

                      setForm({
                        first_name:
                          profile.first_name || "",

                        other_names:
                          profile.other_names || "",

                        last_name:
                          profile.last_name || "",

                        university:
                          profile.university ||
                          "",

                        department:
                          profile.department ||
                          "",

                        institution:
                          profile.institution ||
                          "",

                        country:
                          profile.country ||
                          "",

                        discipline:
                          profile.discipline ||
                          "medicine",

                        academic_stage:
                          profile.academic_stage ||
                          "undergraduate",

                        orcid:
                          profile.orcid ||
                          "",

                        biography:
                          profile.biography ||
                          "",

                        research_interests:
                          profile.research_interests ||
                          "",
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl"
                  >

                    Cancel

                  </button>

                </>

              ) : (

                <button
                  onClick={() => {
                    setEditing(true);
                    setMessage("");
                    setErrorMessage("");
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-xl shadow"
                >

                  Edit Profile

                </button>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
