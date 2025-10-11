<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'property_id', 'sender_id', 'receiver_id', 'message', 'is_read', 'reply_to'
    ];

    public function property() {
        return $this->belongsTo(Property::class);
    }

    public function sender() {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver() {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function replies() {
        return $this->hasMany(Message::class, 'reply_to');
    }
}