<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    use Queueable;

    public $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['database', 'mail']; // use 'mail' for email, 'database' for in-app
    }

    public function toMail($notifiable)
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->line('You have a new message about your property.')
            ->action('View Message', url('/properties/' . $this->message->property_id))
            ->line('Message: ' . $this->message->message);
    }

    public function toArray($notifiable)
    {
        return [
            'property_id' => $this->message->property_id,
            'message' => $this->message->message,
            'from' => $this->message->sender_id,
        ];
    }
}