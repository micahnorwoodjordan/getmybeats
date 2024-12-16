from django.core.cache import cache
from django.contrib import admin

from .models import User, Audio, UserExperienceReport, AudioArtwork


class InvalidModelAdminOperationException(Exception):
    pass


@admin.action(description="Delete selected media (invalidates entire site cache)")
def delete_queryset(modeladmin, request, queryset):
    model_admin_is_ok = isinstance(modeladmin, AudioAdmin) or isinstance(modeladmin, AudioArtworkAdmin)
    if not model_admin_is_ok:
        raise InvalidModelAdminOperationException(f'The chosen operation is not valid for model admin: {modeladmin}')
    cache.clear()
    queryset.delete()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'last_name', 'email']


@admin.register(AudioArtwork)
class AudioArtworkAdmin(admin.ModelAdmin):
    def get_actions(self, request):  # need to invalidate site cache on deletes; default delete op won't accomplish this
        actions = super().get_actions(request)
        del actions['delete_selected']
        return actions

    list_display = ['id', 'file', 'creation_timestamp']
    actions = [delete_queryset]


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
