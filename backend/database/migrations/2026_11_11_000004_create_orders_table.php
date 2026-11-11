<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('public_reference')->unique(); // e.g. WS-2026-ABC123XY
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('users')->cascadeOnDelete();
            $table->string('item_type'); // 'account' or 'cp_bundle'
            $table->foreignId('account_listing_id')->nullable()->constrained('account_listings')->nullOnDelete();
            $table->foreignId('cp_bundle_id')->nullable()->constrained('cp_bundles')->nullOnDelete();

            // Immutable snapshots
            $table->string('item_title_snapshot');
            $table->text('item_description_snapshot')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price_amount', 14, 2);
            $table->string('price_currency', 3)->default('TZS');
            $table->decimal('total_price_amount', 14, 2);

            // Lifecycle status: pending, processing, completed, cancelled, disputed
            $table->string('status')->default('pending');
            $table->timestamp('whatsapp_opened_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            // Indexes for fast lookups & reporting
            $table->index(['customer_id', 'status']);
            $table->index(['vendor_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index(['status', 'completed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

