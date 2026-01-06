using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ProjectBackend.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Bank")]
    public class BankUserController : ControllerBase
    {
        private readonly UserManager<BankUser> _userManager;

        public BankUserController(UserManager<BankUser> userManager)
        {
            _userManager = userManager;
        }

        // GET: api/BankUser
        [HttpGet]
        public ActionResult<IEnumerable<BankUser>> GetAllBankUsers()
        {
            var users = _userManager.Users.ToList();
            return Ok(users);
        }

        // GET: api/BankUser/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<BankUser>> GetBankUserById(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        // PUT: api/BankUser/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult> UpdateBankUser(Guid id, [FromBody] BankUser updatedUser)
        {
            if (id != updatedUser.Id)
            {
                return BadRequest("ID mismatch.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }

            // Update user properties
            user.FirstName = updatedUser.FirstName;
            user.LastName = updatedUser.LastName;
            user.Email = updatedUser.Email;
            user.UserName = updatedUser.UserName;
            user.PersonalIdentificationNumber = updatedUser.PersonalIdentificationNumber;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return NoContent();
        }

        // DELETE: api/BankUser/{id}
        [HttpDelete("{id:guid}")]
        public async Task<ActionResult> DeleteBankUser(Guid id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
            {
                return NotFound();
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return NoContent();
        }
    }
}
