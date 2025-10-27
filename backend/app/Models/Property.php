<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

  protected $fillable = [
    'title',
    'description',
    'price',
    'property_type',
    'status',
    'location',
    'bedrooms',
    'bathrooms',
    'size',
    'user_id',
    'category_id',
    'images',
    // approval fields so update([...]) can set them
        'is_approved',
        'approved_at',
        'approved_by',
        'rejection_reason'
];

protected $casts = [
    'images' => 'array', // auto-cast JSON to array
    'is_approved' => 'boolean',
        'approved_at' => 'datetime',
];

public function favoritedBy()
{
    return $this->belongsToMany(\App\Models\User::class, 'favorites')
                ->withTimestamps();
}

public function reviews()
{
    return $this->hasMany(Review::class);
}

public function user()
{
    return $this->belongsTo(\App\Models\User::class);
}

public function category()
{
    return $this->belongsTo(Category::class);
}
}
