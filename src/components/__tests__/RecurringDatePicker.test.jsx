// src/components/__tests__/RecurringDatePicker.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecurringDatePicker from '../RecurringDatePicker';

// --- Mocking date-fns to ensure consistent test results ---
// We set a fixed date so tests don't fail in the future.
const MOCK_DATE = new Date('2025-07-20T12:00:00.000Z'); // A Sunday
jest.spyOn(global, 'Date').mockImplementation(() => MOCK_DATE);


// --- Test Suite ---
describe('RecurringDatePicker', () => {

  // --- Unit Test Example ---
  // Although getOrdinal is inside the component, we can test its logic
  // by observing its output in the component's summary.
  // A better practice for complex helpers is to export them and test directly.
  test('Unit Test: should display the correct ordinal for dates', () => {
    render(<RecurringDatePicker />);
    // On the 20th, the summary should contain "20th"
    expect(screen.getByText(/on the 20th/i)).toBeInTheDocument();
  });


  // --- Integration Test ---
  test('Integration Test: should update summary and calendar when recurrence rule is changed', () => {
    render(<RecurringDatePicker />);

    // 1. Initial State Check: Verify the default summary text is correct.
    expect(screen.getByText(/Occurs daily, starting Jul 20, 2025./i)).toBeInTheDocument();

    // 2. User Action: Click on the 'Weekly' button.
    const weeklyButton = screen.getByRole('button', { name: /weekly/i });
    fireEvent.click(weeklyButton);

    // 3. Assertion: Check if the summary text updates for the weekly rule.
    // The default for weekly is the start date, which is a Sunday.
    expect(screen.getByText(/Occurs weekly on Sunday, starting Jul 20, 2025./i)).toBeInTheDocument();

    // 4. User Action: Change the interval to every 2 weeks.
    const numberInput = screen.getByRole('spinbutton'); // The 'Every X' input
    fireEvent.change(numberInput, { target: { value: '2' } });

    // 5. Assertion: Check if the summary reflects the new interval.
    expect(screen.getByText(/Occurs every 2 weeks on Sunday, starting Jul 20, 2025./i)).toBeInTheDocument();
    
    // 6. User Action: Add Tuesday to the selection.
    const tuesdayButton = screen.getByRole('button', { name: 'Tu' });
    fireEvent.click(tuesdayButton);
    
    // 7. Assertion: Check if the summary includes Tuesday.
    expect(screen.getByText(/Occurs every 2 weeks on Sunday, Tuesday, starting Jul 20, 2025./i)).toBeInTheDocument();
  });
  
  test('Integration Test: should show confirmation modal on "Confirm Schedule" click', () => {
    render(<RecurringDatePicker />);
    
    // 1. Find and click the confirm button
    const confirmButton = screen.getByRole('button', { name: /Confirm Schedule/i });
    fireEvent.click(confirmButton);
    
    // 2. Assert that the modal appears with the correct title and content
    expect(screen.getByRole('heading', { name: /Schedule Confirmed!/i })).toBeInTheDocument();
    expect(screen.getByText(/The following recurring schedule has been created:/i)).toBeInTheDocument();
    
    // 3. Assert that the summary inside the modal is correct
    expect(screen.getByText('Occurs daily, starting Jul 20, 2025.')).toBeInTheDocument();
    
    // 4. User Action: Close the modal
    const closeButton = screen.getByRole('button', { name: /Create Another Schedule/i });
    fireEvent.click(closeButton);
    
    // 5. Assert that the modal is no longer in the document
    expect(screen.queryByRole('heading', { name: /Schedule Confirmed!/i })).not.toBeInTheDocument();
  });

});
