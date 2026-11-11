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
        Schema::create('cp_bundles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('cp_amount'); // e.g. 80, 420, 880, 2400, 5000, 10800
            $table->decimal('price_amount', 14, 2);
            $table->string('price_currency', 3)->default('TZS');
            $table->string('status')->default('published'); // draft, published, unavailable
            $table->timestamps();
            $table->softDeletes();

            $table->index(['vendor_id', 'status']);
            $table->index(['status', 'cp_amount']);
        });

        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('base_currency', 3)->default('TZS');
            $table->string('quote_currency', 3); // USD, NGN
            $table->decimal('rate', 16, 8); // multiplier: base_amount * rate = quote_amount
            $table->string('source')->default('Admin Managed');
            $table->timestamp('effective_at')->useCurrent();
            $table->timestamps();

            $table->unique(['base_currency', 'quote_currency']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
        Schema::dropIfExists('cp_bundles');
    }
};

