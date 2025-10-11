<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    // List all blogs (and books)
    public function index()
    {
        return response()->json(Blog::with('user')->latest()->get());
    }

    // Store a new blog or book (admin only)
    public function store(Request $request)
    {
        if (!Auth::user() || !Auth::user()->is_admin) {
            return response()->json(['error' => 'Only admins can post blogs/books.'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:120',
            'type' => 'required|in:blog,book',
            'excerpt' => 'nullable|string|max:200',
            'content' => 'nullable|string',
            'book_author' => 'nullable|string|max:120',
            'book_url' => 'nullable|url',
            'image' => 'nullable|image|max:2048', // For upload
        ]);

        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('blog-images', 'public');
        }

        $blog = Blog::create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'] ?? null,
            'book_author' => $validated['book_author'] ?? null,
            'book_url' => $validated['book_url'] ?? null,
            'image' => $imagePath,
            'user_id' => Auth::id(),
        ]);

        return response()->json($blog, 201);
    }

    // Show a single blog/book
    public function show($id)
    {
        $blog = Blog::with('user')->findOrFail($id);
        return response()->json($blog);
    }

    // Update (admin only)
    public function update(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);
        if (!Auth::user() || !Auth::user()->is_admin) {
            return response()->json(['error' => 'Only admins can update blogs/books.'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:120',
            'type' => 'sometimes|required|in:blog,book',
            'excerpt' => 'nullable|string|max:200',
            'content' => 'nullable|string',
            'book_author' => 'nullable|string|max:120',
            'book_url' => 'nullable|url',
            'image' => 'nullable|image|max:2048',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($blog->image) {
                Storage::disk('public')->delete($blog->image);
            }
            $blog->image = $request->file('image')->store('blog-images', 'public');
        }

        $blog->fill($validated)->save();

        return response()->json($blog);
    }

    // Delete (admin only)
    public function destroy($id)
    {
        $blog = Blog::findOrFail($id);
        if (!Auth::user() || !Auth::user()->is_admin) {
            return response()->json(['error' => 'Only admins can delete blogs/books.'], 403);
        }
        // Delete image if exists
        if ($blog->image) {
            Storage::disk('public')->delete($blog->image);
        }
        $blog->delete();
        return response()->json(['message' => 'Deleted'], 200);
    }
}