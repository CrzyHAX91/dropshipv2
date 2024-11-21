from django import forms
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import password_validation

class CustomPasswordChangeForm(PasswordChangeForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['old_password'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Current Password'})
        self.fields['new_password1'].widget.attrs.update({'class': 'form-control', 'placeholder': 'New Password'})
        self.fields['new_password2'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Confirm New Password'})

    def clean_new_password1(self):
        password1 = self.cleaned_data.get('new_password1')
        try:
            password_validation.validate_password(password1, self.user)
        except forms.ValidationError as error:
            self.add_error('new_password1', error)
        return password1

