using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TestService.Domain.Entities;

namespace TestService.Infrastructure.Persistence.Configurations;

/// <summary>
/// Конфигурация сущности TreeNode для EF Core
/// </summary>
public class TreeNodeConfiguration : IEntityTypeConfiguration<TreeNode>
{
    public void Configure(EntityTypeBuilder<TreeNode> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired();

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.Property(t => t.UpdatedAt)
            .IsRequired();

        // Самоссылающаяся связь (родитель-дети)
        builder.HasOne(t => t.Parent)
            .WithMany(t => t.Children)
            .HasForeignKey(t => t.ParentId)
            .OnDelete(DeleteBehavior.Restrict); // Каскадное удаление вручную

        // Связь с User (создатель)
        builder.HasOne(t => t.Creator)
            .WithMany(u => u.CreatedNodes)
            .HasForeignKey(t => t.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(t => t.ParentId);
        builder.HasIndex(t => t.CreatedBy);
        builder.HasIndex(t => t.CreatedAt);

        builder.ToTable("TreeNodes");
    }
}


