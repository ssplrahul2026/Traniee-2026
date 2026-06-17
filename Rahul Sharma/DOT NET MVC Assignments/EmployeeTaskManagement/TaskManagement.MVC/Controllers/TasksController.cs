



using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using TaskManagement.MVC.Services.Interfaces;
using TaskManagement.MVC.ViewModels.Tasks;
using TaskManagement.MVC.ViewModels.Users;

namespace TaskManagement.MVC.Controllers
{
    public class TasksController : Controller
    {
        private readonly IApiService _apiService;
        private readonly ITokenStorageService _tokenStorageService;

        public TasksController(
            IApiService apiService,
            ITokenStorageService tokenStorageService)
        {
            _apiService = apiService;
            _tokenStorageService = tokenStorageService;
        }

        public async Task<IActionResult> Index()
        {
            var authCheck = AllowOnly("Admin", "Manager", "Employee");

            if (authCheck != null)
                return authCheck;

            var user = _tokenStorageService.GetLoggedInUser();
            ViewBag.Role = user?.Role;

            var tasks = await _apiService.GetAsync<List<TaskResponseViewModel>>("tasks");

            return View(tasks ?? new List<TaskResponseViewModel>());
        }
        
        public async Task<IActionResult> Details(int id)
        {
            var authCheck = AllowOnly("Admin", "Manager", "Employee");

            if (authCheck != null)
                return authCheck;

            var task = await _apiService.GetAsync<TaskResponseViewModel>($"tasks/{id}");

            if (task == null)
            {
                TempData["Error"] = "Task not found.";
                return RedirectToAction(nameof(Index));
            }

            return View(task);
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {
            var authCheck = AllowOnly("Admin", "Manager");

            if (authCheck != null)
                return authCheck;

            var model = new CreateTaskViewModel
            {
                DueDate = DateTime.Today.AddDays(1),
                Employees = await GetEmployeeSelectListAsync()
            };

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(CreateTaskViewModel model)
        {
            var authCheck = AllowOnly("Admin", "Manager");

            if (authCheck != null)
                return authCheck;

            if (!ModelState.IsValid)
            {
                model.Employees = await GetEmployeeSelectListAsync();
                return View(model);
            }

            try
            {
                await _apiService.PostAsync<CreateTaskViewModel, TaskResponseViewModel>(
                    "tasks",
                    model);

                TempData["Success"] = "Task created successfully.";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", ex.Message);
                model.Employees = await GetEmployeeSelectListAsync();
                return View(model);
            }
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var authCheck = AllowOnly("Admin", "Manager");

            if (authCheck != null)
                return authCheck;

            var task = await _apiService.GetAsync<TaskResponseViewModel>($"tasks/{id}");

            if (task == null)
            {
                TempData["Error"] = "Task not found.";
                return RedirectToAction(nameof(Index));
            }

            var model = new EditTaskViewModel
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                AssignedToUserId = task.AssignedToUserId,
                Status = task.Status,
                DueDate = task.DueDate,
                Employees = await GetEmployeeSelectListAsync(),
                StatusList = GetStatusList()
            };

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(EditTaskViewModel model)
        {
            var authCheck = AllowOnly("Admin", "Manager");

            if (authCheck != null)
                return authCheck;

            if (!ModelState.IsValid)
            {
                model.Employees = await GetEmployeeSelectListAsync();
                model.StatusList = GetStatusList();
                return View(model);
            }

            try
            {
                await _apiService.PutAsync<EditTaskViewModel, TaskResponseViewModel>(
                    $"tasks/{model.Id}",
                    model);

                TempData["Success"] = "Task updated successfully.";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", ex.Message);
                model.Employees = await GetEmployeeSelectListAsync();
                model.StatusList = GetStatusList();
                return View(model);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var authCheck = AllowOnlyAjax("Admin");

            if (authCheck != null)
                return authCheck;

            try
            {
                var result = await _apiService.DeleteAsync($"tasks/{id}");

                if (!result)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Delete failed."
                    });
                }

                return Json(new
                {
                    success = true,
                    message = "Task deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        public async Task<IActionResult> MyTasks()
        {
            var authCheck = AllowOnly("Employee");

            if (authCheck != null)
                return authCheck;

            var tasks = await _apiService.GetAsync<List<TaskResponseViewModel>>("tasks");

            return View(tasks ?? new List<TaskResponseViewModel>());
        }

        [HttpPost]
        public async Task<IActionResult> UpdateStatus(int id, int status)
        {
            var authCheck = AllowOnlyAjax("Employee");

            if (authCheck != null)
                return authCheck;

            try
            {
                var model = new UpdateTaskStatusViewModel
                {
                    Status = status
                };

                await _apiService.PatchAsync<UpdateTaskStatusViewModel, TaskResponseViewModel>(
                    $"tasks/{id}/status",
                    model);

                return Json(new
                {
                    success = true,
                    message = "Task status updated successfully."
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        private async Task<List<SelectListItem>> GetEmployeeSelectListAsync()
        {
            var employees = await _apiService.GetAsync<List<UserResponseViewModel>>("users/employees");

            return employees?
                .Select(e => new SelectListItem
                {
                    Value = e.Id,
                    Text = $"{e.FullName} ({e.Email})"
                })
                .ToList() ?? new List<SelectListItem>();
        }

        private List<SelectListItem> GetStatusList()
        {
            return new List<SelectListItem>
            {
                new SelectListItem { Value = "1", Text = "Pending" },
                new SelectListItem { Value = "2", Text = "In Progress" },
                new SelectListItem { Value = "3", Text = "Completed" }
            };
        }

        private bool IsLoggedIn()
        {
            return !string.IsNullOrEmpty(_tokenStorageService.GetAccessToken());
        }

        private string GetCurrentRole()
        {
            var user = _tokenStorageService.GetLoggedInUser();
            return user?.Role ?? "";
        }

        private IActionResult? AllowOnly(params string[] roles)
        {
            if (!IsLoggedIn())
            {
                TempData["Error"] = "Please login first.";
                return RedirectToAction("Login", "Account");
            }

            var role = GetCurrentRole();

            if (!roles.Contains(role))
            {
                TempData["Error"] = "You are not authorized to access this page.";
                return RedirectToAction("Index", "Dashboard");
            }

            return null;
        }

        private IActionResult? AllowOnlyAjax(params string[] roles)
        {
            if (!IsLoggedIn())
            {
                return Json(new
                {
                    success = false,
                    message = "Session expired. Please login again."
                });
            }

            var role = GetCurrentRole();

            if (!roles.Contains(role))
            {
                return Json(new
                {
                    success = false,
                    message = "You are not authorized to perform this action."
                });
            }

            return null;
        }
    }
}