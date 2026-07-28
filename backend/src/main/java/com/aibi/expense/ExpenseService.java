
package com.aibi.expense;

import com.aibi.expense.dto.*;
import com.aibi.user.User;
import com.aibi.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public List<ExpenseResponse> getAllExpenses(String category, LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses;

        boolean hasCategory = category != null && !category.isBlank();
        boolean hasDateRange = startDate != null && endDate != null;

        if (hasCategory && hasDateRange) {
            expenses = expenseRepository.findByCategoryAndExpenseDateBetweenOrderByExpenseDateDesc(
                    category, startDate, endDate);
        } else if (hasCategory) {
            expenses = expenseRepository.findByCategoryOrderByExpenseDateDesc(category);
        } else if (hasDateRange) {
            expenses = expenseRepository.findByExpenseDateBetweenOrderByExpenseDateDesc(startDate, endDate);
        } else {
            expenses = expenseRepository.findAllByOrderByExpenseDateDesc();
        }

        return expenses.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = findByIdOrThrow(id);
        return toResponse(expense);
    }

    public ExpenseResponse createExpense(CreateExpenseRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Expense expense = Expense.builder()
                .category(request.getCategory())
                .amount(request.getAmount())
                .description(request.getDescription())
                .expenseDate(request.getExpenseDate())
                .recordedBy(user)
                .build();

        expense = expenseRepository.save(expense);
        return toResponse(expense);
    }

    public ExpenseResponse updateExpense(Long id, UpdateExpenseRequest request) {
        Expense expense = findByIdOrThrow(id);

        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());

        expense = expenseRepository.save(expense);
        return toResponse(expense);
    }

    public void deleteExpense(Long id) {
        Expense expense = findByIdOrThrow(id);
        expenseRepository.delete(expense);
    }

    public List<String> getCategories() {
        return expenseRepository.findDistinctCategories();
    }

    public List<CategoryBreakdown> getCategoryBreakdown(LocalDate startDate, LocalDate endDate) {
        List<Object[]> rows;
        if (startDate != null && endDate != null) {
            rows = expenseRepository.getCategoryBreakdownByDateRange(startDate, endDate);
        } else {
            rows = expenseRepository.getCategoryBreakdown();
        }
        return rows.stream()
                .map(row -> CategoryBreakdown.builder()
                        .category((String) row[0])
                        .total((BigDecimal) row[1])
                        .count(((Number) row[2]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    public List<Object[]> getMonthlyExpenseData() {
        return expenseRepository.getMonthlyExpenseData();
    }

    public BigDecimal getTotalExpenses() {
        return expenseRepository.sumTotalExpenses();
    }

    // ── Helpers ──────────────────────────────────────────────

    private Expense findByIdOrThrow(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found with id: " + id));
    }

    private ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .category(e.getCategory())
                .amount(e.getAmount())
                .description(e.getDescription())
                .expenseDate(e.getExpenseDate())
                .recordedByName(e.getRecordedBy() != null ? e.getRecordedBy().getFullName() : null)
                .createdAt(e.getCreatedAt())
                .build();
    }
}
