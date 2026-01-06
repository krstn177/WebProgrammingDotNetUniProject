using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using ProjectBackend.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectBackend.Infrastructure.DataSeeders
{
    public static class DataSeeder
    {
        public static async Task SeedRolesAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var roles = new[] { "Bank", "Customer" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole<Guid>(role));
                }
            }
        }
        public static async Task SeedAdminBankAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<BankUser>>();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            const string bankEmail = "bank@mybank.com";
            const string bankPassword = "Banker@1234";

            var bankUser = await userManager.FindByEmailAsync(bankEmail);
            if (bankUser == null)
            {
                bankUser = new BankUser
                {
                    Id = Guid.NewGuid(),
                    UserName = "MainBank",
                    FirstName = "Main",
                    LastName = "Bank",
                    PersonalIdentificationNumber = "9005151234",
                    Email = bankEmail,
                    EmailConfirmed = true,
                    SecurityStamp = Guid.NewGuid().ToString()
                };

                var createResult = await userManager.CreateAsync(bankUser, bankPassword);
                if (!createResult.Succeeded)
                {
                    throw new InvalidOperationException($"Failed to create seed user: {string.Join("; ", createResult.Errors.Select(e => e.Description))}");
                }

                await userManager.AddToRoleAsync(bankUser, "Bank");
            }

            var existingAccount = db.BankAccounts.FirstOrDefault(a => a.BankUserId == bankUser.Id);
            if (existingAccount == null)
            {
                var bankAccount = new BankAccount
                {
                    BankUserId = bankUser.Id,
                    IBAN = "BANK0000000001",
                    Balance = 1_000_000m // initial capital
                };

                db.BankAccounts.Add(bankAccount);
                await db.SaveChangesAsync();
            }
        }
    }
}
