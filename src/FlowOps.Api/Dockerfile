FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/FlowOps.Api/FlowOps.Api.csproj", "src/FlowOps.Api/"]
RUN dotnet restore "src/FlowOps.Api/FlowOps.Api.csproj"
COPY . .
WORKDIR "/src/src/FlowOps.Api"
RUN dotnet build "FlowOps.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FlowOps.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "FlowOps.Api.dll"]
