<?php
// app/Http/Controllers/RoleController.php
// app/Http/Controllers/RoleController.php
namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Role::all()]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $role = Role::create($request->all());

        return response()->json([
            'data' => Role::all(),
            'message' => 'Role created successfully',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $role = Role::findOrFail($id);
        $role->update($request->all());

        return response()->json(['data' => Role::all()]);
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();

        return response()->json(['data' => Role::all()]);
    }
}
