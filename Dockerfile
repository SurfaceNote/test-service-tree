FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Копировать все .csproj файлы
COPY ["TestService.Api/TestService.Api.csproj", "TestService.Api/"]
COPY ["TestService.Application/TestService.Application.csproj", "TestService.Application/"]
COPY ["TestService.Domain/TestService.Domain.csproj", "TestService.Domain/"]
COPY ["TestService.Infrastructure/TestService.Infrastructure.csproj", "TestService.Infrastructure/"]

# Восстановить зависимости
RUN dotnet restore "TestService.Api/TestService.Api.csproj"

# Копировать весь исходный код
COPY . .

# Собрать проект
WORKDIR "/src/TestService.Api"
RUN dotnet build "TestService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TestService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TestService.Api.dll"]


