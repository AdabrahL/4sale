<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Property;
use Carbon\Carbon;

class InsightsController extends Controller
{
    public function stats()
    {
        $properties = Property::all();

        if ($properties->count() === 0) {
            return response()->json([
                'avgPrice' => 0,
                'topLocation' => null,
                'topType' => null,
                'listedToday' => 0,
                'demandTrend' => "N/A"
            ]);
        }

        $avgPrice = (int) $properties->avg('price');

        $topLocation = $properties->groupBy('location')
            ->sortByDesc(fn($g) => $g->count())
            ->keys()->first();

        $topType = $properties->groupBy('type')
            ->sortByDesc(fn($g) => $g->count())
            ->keys()->first();

        $today = Carbon::today()->toDateString();
        $listedToday = $properties->where('created_at', '>=', $today)->count();

        return response()->json([
            'avgPrice' => $avgPrice,
            'topLocation' => $topLocation,
            'topType' => $topType,
            'listedToday' => $listedToday,
            'demandTrend' => "N/A"
        ]);
    }

    public function pricesMonthly()
    {
        $properties = Property::all();
        $grouped = [];

        foreach ($properties as $p) {
            $d = Carbon::parse($p->created_at);
            $key = $d->format("Y-m");

            if (!isset($grouped[$key])) {
                $grouped[$key] = ['sum' => 0, 'count' => 0, 'year' => $d->year, 'month' => $d->month - 1];
            }
            $grouped[$key]['sum'] += $p->price;
            $grouped[$key]['count']++;
        }

        $result = [];
        foreach ($grouped as $key => $g) {
            $result[] = [
                'month' => $key,
                'price' => round($g['sum'] / $g['count'])
            ];
        }

        return response()->json($result);
    }
}
