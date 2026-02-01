using Microsoft.OpenApi.Models;

namespace TestService.Api.Init;

/// <summary>
/// Инициализация Swagger документации
/// </summary>
public static class SwaggerInitializer
{
    /// <summary>
    /// Регистрация Swagger с поддержкой JWT
    /// </summary>
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Tree Catalog API",
                Version = "v1",
                Description = "API для управления древовидной иерархической структурой данных"
            });

            // Добавить поддержку JWT аутентификации в Swagger
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "Сюда необходимо вставить токен",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }

    /// <summary>
    /// Использование Swagger в приложении
    /// </summary>
    public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Tree Catalog API v1");
            options.RoutePrefix = "swagger"; // Swagger UI доступен по /swagger
        });

        return app;
    }
}


