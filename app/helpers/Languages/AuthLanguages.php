<?php

namespace App\Helpers\Languages;

class AuthLanguages
{
    public static function getAll(): array
    {
        return [
            // Login
            'welcome_back' => __('auth.welcome_back'),
            'sign_in_account' => __('auth.sign_in_account'),
            'email_address' => __('auth.email_address'),
            'password' => __('auth.password'),
            'forgot_password' => __('auth.forgot_password'),
            'sign_in' => __('auth.sign_in'),
            'dont_have_account' => __('auth.dont_have_account'),

            // Register
            'create_account' => __('auth.create_account'),
            'fill_details' => __('auth.fill_details'),
            'name' => __('auth.name'),
            'username' => __('auth.username'),
            'username_placeholder' => __('auth.username_placeholder'),
            'phone_number' => __('auth.phone_number'),
            'confirm_password' => __('auth.confirm_password'),
            'create_password' => __('auth.create_password'),
            'already_have_account' => __('auth.already_have_account'),
            'enter_full_name' => __('auth.enter_full_name'),
            'enter_email' => __('auth.enter_email'),
            'phone_example' => __('auth.phone_example'),
            'username_hint' => __('auth.username_hint'),

            // Common
            'sign_up' => __('auth.sign_up'),
            'or_continue_with' => __('auth.or_continue_with'),
            'google_account' => __('auth.google_account'),

            // qoute
            'app_quote' => __('auth.app_quote'),
            'quote_author' => __('auth.quote_author'),

            //validate Auth
            'validation_email_password_invalid' => __('auth.validation_email_password_invalid'),
            'validation_email_required' => __('auth.validation_email_required'),
            'validation_email_invalid' => __('auth.validation_email_invalid'),
            'validation_password_required' => __('auth.validation_password_required'),
            'validation_password_min' => __('auth.validation_password_min'),
            'validation_password_uppercase' => __('auth.validation_password_uppercase'),
            'validation_password_number' => __('auth.validation_password_number'),
            'validation_name_required' => __('auth.validation_name_required'),
            'validation_name_min' => __('auth.validation_name_min'),
            'validation_username_required' => __('auth.validation_username_required'),
            'validation_username_min' => __('auth.validation_username_min'),
            'validation_username_max' => __('auth.validation_username_max'),
            'validation_username_format' => __('auth.validation_username_format'),
            'validation_phone_required' => __('auth.validation_phone_required'),
            'validation_phone_invalid' => __('auth.validation_phone_invalid'),
        ];
    }
}