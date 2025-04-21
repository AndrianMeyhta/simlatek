<?php

namespace App\Http\Controllers;

use App\Models\RbieRule;
use Illuminate\Http\Request;

class RbieRuleController extends Controller
{
    public function index()
    {
        return response()->json(['data' => RbieRule::all()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'tahapanconstrain_id' => 'required|exists:tahapanconstrains,id',
            'preprocessing' => 'nullable|array',
            'matching_rules' => 'required|array',
        ]);
        $rbieRule = RbieRule::create($request->all());
        return response()->json(['data' => $rbieRule], 201);
    }

    public function update(Request $request, $id)
    {
        $rbieRule = RbieRule::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:255',
            'tahapanconstrain_id' => 'required|exists:tahapanconstrains,id',
            'preprocessing' => 'nullable|array',
            'matching_rules' => 'required|array',
        ]);
        $rbieRule->update($request->all());
        return response()->json(['data' => $rbieRule]);
    }

    public function destroy($id)
    {
        $rbieRule = RbieRule::findOrFail($id);
        $rbieRule->delete();
        return response()->json(['message' => 'RBIE Rule deleted successfully']);
    }
}
