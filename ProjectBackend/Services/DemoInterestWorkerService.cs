using ProjectBackend.Infrastructure.Interfaces;
using ProjectBackend.Infrastructure.Models;

namespace ProjectBackend.Services
{
    /// <summary>
    /// Simple demo worker that applies an artificial interest accrual to active loans
    /// while the server is running. Runs on a configurable interval (default: 1 minute).
    /// 
    /// Notes:
    /// - This is intentionally simple for a college project demo.
    /// - It derives a per-minute rate from the loan's InterestRate assuming InterestRate
    ///   represents an annual percentage (APR). Per-minute rate = APR / 100 / minutesPerYear.
    /// - It updates RemainingAmount in place and advances NextInterestUpdate by the interval.
    /// - Rounding is to 2 decimals (adjust if you need different behavior).
    /// </summary>
    public class DemoInterestWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DemoInterestWorker> _logger;
        private readonly TimeSpan _interval;

        // minutes in a (non-leap) year: 365 * 24 * 60 = 525600
        private const decimal MinutesPerYear = 525600m;

        public DemoInterestWorker(IServiceScopeFactory scopeFactory, ILogger<DemoInterestWorker> logger, TimeSpan? interval = null)
        {
            _scopeFactory = scopeFactory ?? throw new ArgumentNullException(nameof(scopeFactory));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _interval = interval ?? TimeSpan.FromMinutes(1);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DemoLoanInterestWorker started. Interval: {Interval}", _interval);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessOnceAsync(stoppingToken).ConfigureAwait(false);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    // graceful shutdown
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while applying demo loan interest.");
                }

                try
                {
                    await Task.Delay(_interval, stoppingToken).ConfigureAwait(false);
                }
                catch (TaskCanceledException) { /* shutting down */ }
            }

            _logger.LogInformation("DemoLoanInterestWorker stopping.");
        }

        private async Task ProcessOnceAsync(CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<ILoanRepository>();

            var loans = (await repo.GetAllAsync(cancellationToken).ConfigureAwait(false)).ToList();

            if (!loans.Any())
            {
                _logger.LogDebug("No loans found to process.");
                return;
            }

            var now = DateTime.UtcNow;
            var anyChanges = false;

            foreach (var loan in loans)
            {
                // Only process active loans with a positive remaining amount
                if (loan == null || loan.Status != LoanStatus.Active || loan.RemainingAmount <= 0m)
                    continue;

                // Compute per-minute interest rate from annual percentage rate (APR).
                // Example: InterestRate == 5.00 -> 5% APR -> per-minute = 0.05 / 525600
                var perMinuteRate = (loan.InterestRate / 100m) / MinutesPerYear;

                if (perMinuteRate <= 0m)
                    continue;

                // Apply interest once per interval; simple compounding for the interval length.
                // For small rates this multiplication is fine for demo purposes.
                var old = loan.RemainingAmount;
                var updated = loan.RemainingAmount * (1m + perMinuteRate * (decimal)_interval.TotalMinutes);

                // Round to 2 decimals (money). Change rounding strategy as needed.
                loan.RemainingAmount = Math.Round(updated, 2, MidpointRounding.AwayFromZero);

                // Advance NextInterestUpdate for display/demo purposes
                loan.NextInterestUpdate = now.Add(_interval);

                repo.Update(loan);
                anyChanges = true;

                _logger.LogDebug(
                    "Applied demo interest to loan {LoanId}: {Old:C} -> {New:C} (ratePerMin: {Rate})",
                    loan.Id, old, loan.RemainingAmount, perMinuteRate);
            }

            if (anyChanges)
            {
                var saved = await repo.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
                _logger.LogInformation("DemoLoanInterestWorker applied interest to loans. Changes saved: {Saved}", saved);
            }
        }
    }
}
