from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "created_at",
            "profile_image",
        ]

    def get_profile_image(self, obj):
        try:
            profile = obj.profile

            if profile.profile_image:
                request = self.context.get("request")

                if request:
                    return request.build_absolute_uri(
                        profile.profile_image.url
                    )

                return profile.profile_image.url

        except Exception:
            pass

        return None