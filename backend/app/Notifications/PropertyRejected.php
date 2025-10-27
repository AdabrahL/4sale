<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Property;

class PropertyRejected extends Notification
{
    use Queueable;

    protected Property $property;
    protected ?string $reason;

    public function __construct(Property $property, ?string $reason = null)
    {
        $this->property = $property;
        $this->reason = $reason;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $property = $this->property;
        $reason = $this->reason ? $this->reason : 'No reason provided.';

        return (new MailMessage)
            ->subject("Your property was not approved: {$property->title}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Unfortunately, your property listing \"{$property->title}\" has not been approved.")
            ->line("Reason: {$reason}")
            ->line('You may edit your listing and resubmit for approval.')
            ->action('Edit your listing', config('app.frontend_url') ?? config('app.url') . "/properties/{$property->id}/edit")
            ->line('If you need help, contact support.');
    }
}