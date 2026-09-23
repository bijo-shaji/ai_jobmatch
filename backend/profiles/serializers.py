from rest_framework import serializers

from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "id",
            "full_name",
            "phone",
            "location",
            "bio",
            "profile_image",
        ]

    def get_profile_image(self, obj):
        if obj.profile_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_image.url)
            return obj.profile_image.url
        return None