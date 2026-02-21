<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Verification Code</title>
</head>

<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 40px;">
    <div
        style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h2 style="color: #1a1a1a; margin-top: 0;">Hello, {{ $name }}!</h2>
        <p style="color: #555;">Use the verification code below to complete your registration. This code is valid for
            <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 32px 0;">
            <span
                style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #4f46e5; background: #eef2ff; padding: 16px 24px; border-radius: 8px;">
                {{ $code }}
            </span>
        </div>
        <p style="color: #999; font-size: 13px;">If you did not request this, please ignore this email.</p>
    </div>
</body>

</html>