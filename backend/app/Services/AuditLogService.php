<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Record an administrative or financial state change.
     */
    public static function log(?User $actor, string $action, ?Model $target = null, array $metadata = []): AuditLog
    {
        // Sanitize metadata to never include sensitive keywords
        $sanitizedMetadata = self::sanitize($metadata);

        return AuditLog::create([
            'actor_id' => $actor?->id,
            'action' => $action,
            'target_type' => $target ? get_class($target) : null,
            'target_id' => $target?->getKey(),
            'metadata' => $sanitizedMetadata ?: null,
            'ip_address' => Request::ip(),
            'user_agent' => substr((string) Request::userAgent(), 0, 500),
            'created_at' => now(),
        ]);
    }

    private static function sanitize(array $data): array
    {
        $sensitiveKeys = ['password', 'password_confirmation', 'token', 'secret', 'api_key', 'access_token'];
        $clean = [];

        foreach ($data as $key => $value) {
            if (in_array(strtolower($key), $sensitiveKeys, true)) {
                continue;
            }

            if (is_array($value)) {
                $clean[$key] = self::sanitize($value);
            } else {
                $clean[$key] = $value;
            }
        }

        return $clean;
    }
}

