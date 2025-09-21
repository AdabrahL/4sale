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
    'images'
];

protected $casts = [
    'images' => 'array', // auto-cast JSON to array
];
}
