<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Property;

class PropertySubmitted extends Notification
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
        $adminUrl = config('app.url') . '/admin/properties/pending'; // link for admin dashboard

        return (new MailMessage)
            ->subject("New property submitted: {$property->title}")
            ->greeting('Hello Admin,')
            ->line("A new property has been submitted by user ID: {$property->user_id}.")
            ->line("Title: {$property->title}")
            ->line("Location: {$property->location}")
            ->action('Review pending properties', $adminUrl)
            ->line('Approve or reject the listing from the admin panel.');
    }
}
