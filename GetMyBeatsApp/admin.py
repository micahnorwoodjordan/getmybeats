from django.core.cache import cache
from django.contrib import admin

from .models import User, Audio, UserExperienceReport


class InvalidModelAdminOperationException(Exception):
    pass


@admin.action(description="Delete selected Audio objects (invalidates entire site cache)")
def delete_queryset(modeladmin, request, queryset):
    if not isinstance(modeladmin, AudioAdmin):
        raise InvalidModelAdminOperationException(f'The chosen operation is not valid for model admin: {modeladmin}')
    cache.clear()
    queryset.delete()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'last_name', 'email']


@admin.register(Audio)
class AudioAdmin(admin.ModelAdmin):
    def get_actions(self, request):  # need to invalidate site cache on deletes; default delete op won't accomplish this
        actions = super().get_actions(request)
        del actions['delete_selected']
        return actions

    list_display = ['id', 'title', 'fk_uploaded_by']
    actions = [delete_queryset]


@admin.register(UserExperienceReport)
class UserExperienceReportAdmin(admin.ModelAdmin):
    def get_actions(self, request):
        actions = super().get_actions(request)
        del actions['delete_selected']
        return actions

    list_display = ['issues', 'upcoming', 'recent']
