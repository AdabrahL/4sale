<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Property;

class PropertyApproved extends Notification
{
    use Queueable;

    protected Property $property;

    public function __construct(Property $property)
    {
        $this->property = $property;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $property = $this->property;
        $frontendUrl = config('app.frontend_url') ?? config('app.url'); // optional FRONTEND_URL in .env

        return (new MailMessage)
            ->subject("Your property was approved: {$property->title}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Good news — your property listing \"{$property->title}\" has been approved and is now visible to the public.")
            ->action('View listing', $frontendUrl . "/properties/{$property->id}")
            ->line('Thank you for using our platform.');
    }
}