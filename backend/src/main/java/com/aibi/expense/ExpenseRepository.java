package com.aibi.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findAllByOrderByExpenseDateDesc();

    List<Expense> findByExpenseDateBetweenOrderByExpenseDateDesc(LocalDate start, LocalDate end);

    List<Expense> findByCategoryOrderByExpenseDateDesc(String category);

    List<Expense> findByCategoryAndExpenseDateBetweenOrderByExpenseDateDesc(
            String category, LocalDate start, LocalDate end);

    @Query("SELECT DISTINCT e.category FROM Expense e ORDER BY e.category")
    List<String> findDistinctCategories();

    @Query("SELECT e.category, SUM(e.amount), COUNT(e) FROM Expense e GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> getCategoryBreakdown();

    @Query("SELECT e.category, SUM(e.amount), COUNT(e) FROM Expense e " +
           "WHERE e.expenseDate BETWEEN :start AND :end " +
           "GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> getCategoryBreakdownByDateRange(
            @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query(value = "SELECT TO_CHAR(expense_date, 'YYYY-MM') as month, SUM(amount) as total " +
                   "FROM expenses GROUP BY TO_CHAR(expense_date, 'YYYY-MM') " +
                   "ORDER BY month", nativeQuery = true)
    List<Object[]> getMonthlyExpenseData();

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    BigDecimal sumTotalExpenses();
}
