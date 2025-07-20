
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecurringDatePicker from '../RecurringDatePicker';

const MOCK_DATE = new Date('2025-07-20T12:00:00.000Z'); 
jest.spyOn(global, 'Date').mockImplementation(() => MOCK_DATE);

describe('RecurringDatePicker', () => {

  test('Unit Test: should display the correct ordinal for dates', () => {
    render(<RecurringDatePicker />);
    expect(screen.getByText(/on the 20th/i)).toBeInTheDocument();
  });


  test('Integration Test: should update summary and calendar when recurrence rule is changed', () => {
    render(<RecurringDatePicker />);

    expect(screen.getByText(/Occurs daily, starting Jul 20, 2025./i)).toBeInTheDocument();

    const weeklyButton = screen.getByRole('button', { name: /weekly/i });
    fireEvent.click(weeklyButton);
    expect(screen.getByText(/Occurs weekly on Sunday, starting Jul 20, 2025./i)).toBeInTheDocument();

    const numberInput = screen.getByRole('spinbutton'); 
    fireEvent.change(numberInput, { target: { value: '2' } });

    expect(screen.getByText(/Occurs every 2 weeks on Sunday, starting Jul 20, 2025./i)).toBeInTheDocument();
    
    const tuesdayButton = screen.getByRole('button', { name: 'Tu' });
    fireEvent.click(tuesdayButton);
    
    expect(screen.getByText(/Occurs every 2 weeks on Sunday, Tuesday, starting Jul 20, 2025./i)).toBeInTheDocument();
  });
  
  test('Integration Test: should show confirmation modal on "Confirm Schedule" click', () => {
    render(<RecurringDatePicker />);
    
    const confirmButton = screen.getByRole('button', { name: /Confirm Schedule/i });
    fireEvent.click(confirmButton);
    
    expect(screen.getByRole('heading', { name: /Schedule Confirmed!/i })).toBeInTheDocument();
    expect(screen.getByText(/The following recurring schedule has been created:/i)).toBeInTheDocument();
    
    expect(screen.getByText('Occurs daily, starting Jul 20, 2025.')).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: /Create Another Schedule/i });
    fireEvent.click(closeButton);
    
    expect(screen.queryByRole('heading', { name: /Schedule Confirmed!/i })).not.toBeInTheDocument();
  });

});
