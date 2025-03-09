import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  .animate-fade-in {
    animation: ${fadeIn} 0.5s ease-out;
  }

  h2 {
    margin-bottom: 2rem;
    color: var(--text-primary);
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: -0.5px;
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -8px;
      width: 40px;
      height: 4px;
      background: linear-gradient(90deg, var(--primary-color), transparent);
      border-radius: 2px;
    }
  }

  .ant-form {
    background: var(--card-background);
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .ant-form-item {
    margin-bottom: 2rem;
  }

  .ant-form-item-label > label {
    color: var(--text-primary) !important;
    font-size: 0.95rem;
    font-weight: 500;
    opacity: 0.9;
    margin-bottom: 0.5rem;
  }

  .ant-input,
  .ant-input-number,
  .ant-input-textarea {
    background-color: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: var(--text-primary);
    padding: 12px 16px;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(59, 130, 246, 0.5);
      background-color: rgba(0, 0, 0, 0.3);
    }

    &:focus {
      border-color: var(--primary-color);
      background-color: rgba(0, 0, 0, 0.4);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }

  textarea.ant-input {
    min-height: 120px;
    line-height: 1.6;
  }

  .ant-form-item-required::before {
    color: var(--primary-color) !important;
  }

  .ant-form-item-explain-error {
    color: #ef4444;
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }

  .ant-btn {
    min-width: 160px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary-color), #2563eb);
    border: none;
    color: white;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    .anticon {
      font-size: 1.1rem;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(rgba(255, 255, 255, 0.1), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);

      &::before {
        opacity: 1;
      }
    }

    &:active {
      transform: translateY(0);
    }

    &.ant-btn-default {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;

    h2 {
      font-size: 1.75rem;
    }

    .ant-form {
      padding: 1.5rem;
    }

    .form-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .ant-btn {
      width: 100%;
    }
  }
`; 