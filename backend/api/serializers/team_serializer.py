from rest_framework import serializers
from api.models.team_members import TeamMembers

class TeamSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model=TeamMembers
        fields=['member_id','userId','email','status','privilege','updated_at','name']
    
    def get_name(self, obj):
        return obj.userId.name if obj.userId else None