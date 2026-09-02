from django.test import TestCase, override_settings

from journal.models import User
from journal.serializers import UserRegistrationSerializer, UserSerializer
from rest_framework.test import APIClient


@override_settings(SECURE_SSL_REDIRECT=False)
class RegistrationTests(TestCase):
    def valid_data(self, **overrides):
        data = {
            "first_name": "Ada",
            "other_names": "Lovelace",
            "last_name": "Byron",
            "username": "ada.researcher",
            "email": "ada@example.com",
            "password": "StrongPass9!",
            "role": "author",
        }
        data.update(overrides)
        return data

    def test_valid_registration_persists_identity_fields(self):
        serializer = UserRegistrationSerializer(data=self.valid_data())
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertEqual(user.first_name, "Ada")
        self.assertEqual(user.other_names, "Lovelace")
        self.assertEqual(user.last_name, "Byron")
        self.assertEqual(user.full_name, "Ada Lovelace Byron")
        self.assertTrue(user.check_password("StrongPass9!"))

    def test_password_policy_rejects_invalid_password(self):
        serializer = UserRegistrationSerializer(
            data=self.valid_data(password="weakpassword")
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_password_cannot_contain_username(self):
        serializer = UserRegistrationSerializer(
            data=self.valid_data(password="Ada.researcher9!")
        )

        self.assertFalse(serializer.is_valid())
        self.assertEqual(
            serializer.errors["password"][0],
            "Password must not contain your username.",
        )

    def test_duplicate_username_is_rejected(self):
        User.objects.create_user(
            username="ada.researcher",
            email="existing@example.com",
            password="ExistingPass9!",
        )

        serializer = UserRegistrationSerializer(data=self.valid_data())

        self.assertFalse(serializer.is_valid())
        self.assertEqual(
            serializer.errors["username"][0],
            "A user with that username already exists.",
        )

    def test_duplicate_email_is_rejected_case_insensitively(self):
        User.objects.create_user(
            username="existing-user",
            email="ADA@example.com",
            password="ExistingPass9!",
        )

        serializer = UserRegistrationSerializer(data=self.valid_data())

        self.assertFalse(serializer.is_valid())
        self.assertEqual(
            serializer.errors["email"][0],
            "A user with that email already exists.",
        )

    def test_profile_identity_update_derives_full_name(self):
        user = User.objects.create_user(
            username="profile-user",
            email="profile@example.com",
            password="StrongPass9!",
            first_name="Old",
            last_name="Name",
            full_name="Old Name",
        )
        serializer = UserSerializer(
            user,
            data={"first_name": "New", "other_names": "Research", "last_name": "User"},
            partial=True,
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated = serializer.save()
        self.assertEqual(updated.full_name, "New Research User")

    def test_normal_user_cannot_create_users_through_management_endpoint(self):
        user = User.objects.create_user(
            username="regular-user",
            email="regular@example.com",
            password="StrongPass9!",
            role="author",
        )
        client = APIClient()
        client.force_authenticate(user)
        response = client.post(
            "/api/users/",
            {"username": "unexpected", "email": "unexpected@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
