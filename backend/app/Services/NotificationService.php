<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    /**
     * Create a notification for a user.
     */
    public static function create($userId, $type, $title, $message, $data = [])
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Notify user when their property is approved.
     */
    public static function propertyApproved($property)
    {
        return self::create(
            $property->user_id,
            'property_approved',
            'Property Approved! 🎉',
            "Your property '{$property->title}' has been approved and is now live.",
            ['property_id' => $property->id]
        );
    }

    /**
     * Notify user when their property is rejected.
     */
    public static function propertyRejected($property)
    {
        return self::create(
            $property->user_id,
            'property_rejected',
            'Property Needs Review',
            "Your property '{$property->title}' was not approved. Please review and resubmit.",
            ['property_id' => $property->id]
        );
    }

    /**
     * Notify user when someone favorites their property.
     */
    public static function propertyFavorited($property, $user)
    {
        return self::create(
            $property->user_id,
            'new_favorite',
            'New Favorite! ❤️',
            "{$user->name} saved your property '{$property->title}'.",
            ['property_id' => $property->id, 'user_id' => $user->id]
        );
    }

    /**
     * Notify user when they receive a new message.
     */
    public static function newMessage($message, $sender)
    {
        return self::create(
            $message->receiver_id,
            'new_message',
            'New Message 💬',
            "{$sender->name} sent you a message.",
            ['message_id' => $message->id, 'sender_id' => $sender->id]
        );
    }

    /**
     * Notify user when their property receives a review.
     */
    public static function newReview($review, $property, $reviewer)
    {
        return self::create(
            $property->user_id,
            'new_review',
            'New Review ⭐',
            "{$reviewer->name} left a review on your property '{$property->title}'.",
            ['property_id' => $property->id, 'review_id' => $review->id]
        );
    }

    /**
     * Notify user when their blog post is commented on.
     */
    public static function newComment($comment, $blog, $commenter)
    {
        return self::create(
            $blog->user_id,
            'new_comment',
            'New Comment 💭',
            "{$commenter->name} commented on your blog post.",
            ['blog_id' => $blog->id, 'comment_id' => $comment->id]
        );
    }

    /**
     * Notify user about property boost activation.
     */
    public static function propertiesBoosted($userId, $count, $plan)
    {
        $planNames = [1 => 'Basic', 2 => 'Standard', 3 => 'Premium'];
        $planName = $planNames[$plan] ?? 'Premium';
        
        return self::create(
            $userId,
            'properties_boosted',
            'Properties Boosted! 🚀',
            "Your {$count} properties have been boosted with the {$planName} plan.",
            ['count' => $count, 'plan' => $plan]
        );
    }

    /**
     * Notify admin of new property submission.
     */
    public static function newPropertySubmission($property, $adminIds)
    {
        foreach ($adminIds as $adminId) {
            self::create(
                $adminId,
                'new_property_submission',
                'New Property Pending',
                "A new property '{$property->title}' is awaiting approval.",
                ['property_id' => $property->id]
            );
        }
    }
}
