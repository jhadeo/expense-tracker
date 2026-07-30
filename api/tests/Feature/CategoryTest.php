<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;
    public function test_user_can_create_category(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/categories', [
            'name' => 'Food',
            'type' => 'expenses',
        ]);

        $response
            ->assertCreated()
            ->assertJson([
                'data' => [
                    'name' => 'Food',
                    'type' => 'expenses',
                ],
            ]);

        $this->assertDatabaseHas('categories', [
            'user_id' => $user->id,
            'name' => 'Food',
        ]);
    }

    public function test_user_cannot_create_category_with_invalid_type(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/categories', [
            'name' => 'Food',
            'type' => 'invalid',
        ]);

        $response->assertUnprocessable();
    }

    public function test_guest_cannot_create_category(): void
    {

        $response = $this->postJson('/api/categories', [
            'name' => 'Food',
            'type' => 'expenses',
        ]);

        $response->assertUnauthorized();
    }

    public function test_category_name_must_be_unique_per_user(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        Category::factory()->for($user)->create([
            'name' => 'Food',
        ]);

        $response = $this->postJson('/api/categories', [
            'name' => 'Food',
            'type' => 'expenses',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_user_can_view_system_category(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $cat = Category::factory()->create(['user_id' => null]);

        $response = $this->getJson("/api/categories/{$cat->id}");
        $response->assertOk();
    }

    public function test_user_can_view_own_category(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create();

        $response = $this->getJson("/api/categories/{$cat->id}");
        $response->assertOk();
    }

    public function test_user_can_index_categories(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        Category::factory()->for($user)->create(['name' => 'test', 'type' => 'expenses']);
        Category::factory()->for($other)->create(['name' => 'car', 'type' => 'expenses']);
        Category::factory()->create(['user_id' => null, 'name' => 'system', 'type' => 'expenses']);

        $response = $this->getJson("/api/categories");
        $response
            ->assertOk()
            ->assertJsonFragment([
                'name' => 'test',
            ])
            ->assertJsonFragment([
                'name' => 'system',
            ])
            ->assertJsonMissing([
                'name' => 'car',
            ]);
    }

    public function test_user_cannot_view_others_category(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        $cat = Category::factory()->create(['user_id' => $other->id]);

        $response = $this->getJson("/api/categories/{$cat->id}");
        $response->assertNotFound();
    }

    public function test_user_can_update_category(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create();

        $response = $this->putJson("/api/categories/{$cat->id}", [
            'name' => 'test'
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('categories', [
            'user_id' => $user->id,
            'name' => 'test'
        ]);
    }

    public function test_user_can_update_category_with_duplicate_name(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create();
        Category::factory()->for($other)->create(['name' => 'test']);

        $response = $this->putJson("/api/categories/{$cat->id}", [
            'name' => 'test'
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('categories', [
            'user_id' => $user->id,
            'name' => 'test'
        ]);

        $this->assertDatabaseHas('categories', [
            'user_id' => $other->id,
            'name' => 'test'
        ]);
    }

    public function test_user_cannot_update_others_category(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($user);

        $cat = Category::factory()->for($other)->create();

        $response = $this->putJson("/api/categories/{$cat->id}", [
            'name' => 'test'
        ]);

        $response->assertNotFound();
    }

    public function test_user_cannot_update_system_category(): void
    {
        $user = User::factory()->create();


        Sanctum::actingAs($user);

        $cat = Category::factory()->create(['user_id' => null]);

        $response = $this->putJson("/api/categories/{$cat->id}", [
            'name' => 'test'
        ]);

        $response->assertForbidden();
    }

    public function test_user_cannot_update_category_to_duplicate_name(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create();
        Category::factory()->for($user)->create(['name' => 'test']);

        $response = $this->putJson("/api/categories/{$cat->id}", [
            'name' => 'test'
        ]);

        $response->assertUnprocessable();
    }

    public function test_user_can_delete_category(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $category = Category::factory()->for($user)->create();

        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertOk();

        $this->assertSoftDeleted('categories', [
            'id' => $category->id,
        ]);
    }

    public function test_user_cannot_delete_system_category(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $category = Category::factory()->create([
            'user_id' => null,
        ]);

        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertForbidden();
    }

    public function test_user_cannot_delete_others_category(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($user);

        $category = Category::factory()->for($other)->create();

        $response = $this->deleteJson("/api/categories/{$category->id}");

        $response->assertNotFound();
    }

    public function test_user_can_restore_category(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $category = Category::factory()->for($user)->create();

        $category->delete();

        $response = $this->patchJson("/api/categories/{$category->id}");

        $response->assertOk();

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'deleted_at' => null,
        ]);
    }

    public function test_user_cannot_restore_system_category(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $category = Category::factory()->create([
            'user_id' => null,
        ]);

        $category->delete();

        $response = $this->patchJson("/api/categories/{$category->id}");

        $response->assertForbidden();
    }

    public function test_user_cannot_restore_others_category(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($user);

        $category = Category::factory()->for($other)->create();

        $category->delete();

        $response = $this->patchJson("/api/categories/{$category->id}");

        $response->assertNotFound();
    }
}
