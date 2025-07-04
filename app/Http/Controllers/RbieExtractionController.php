<?php

namespace App\Http\Controllers;

use App\Models\RbieExtraction;
use Illuminate\Http\Request;

class RbieExtractionController extends Controller
{
    public function index()
    {
        return response()->json(['data' => RbieExtraction::all()]);
    }
}
