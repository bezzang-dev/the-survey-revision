import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from '../reducers/store';
import SurveyFormPage from '../routes/SurveyPages/SurveyFormPage';
import { QuestionType } from '../types/request/Question';

// mock scroll functions
window.HTMLElement.prototype.scrollIntoView = () => {};
window.scrollTo = () => {};

describe('[SurveyFormPage Test]', () => {
  function setUp() {
    return render(
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <MemoryRouter initialEntries={['/survey/form']}>
            <Routes>
              <Route path="/survey/form" element={<SurveyFormPage />} />
            </Routes>
          </MemoryRouter>
        </PersistGate>
      </Provider>
    );
  }

  it('initial rendering SurveyFormPage', () => {
    setUp();

    const pageTitle = screen.getByText('설문조사 작성');
    const surveyTitle = screen.getByPlaceholderText('설문지의 제목을 입력해주세요');
    // TODO: Certification list test
    const startedDate = screen.getByLabelText('시작일 :');
    const endedDate = screen.getByLabelText('종료일 :');
    const surveyDescription = screen.getByPlaceholderText('설문지의 설명을 입력해주세요');
    const addQuestionButton = screen.getByTestId('addQuestion');
    const submitButton = screen.getByText('제출하기');

    expect(pageTitle).toBeInTheDocument();
    expect(surveyTitle).toBeInTheDocument();
    expect(surveyDescription).toBeInTheDocument();
    expect(startedDate).toBeInTheDocument();
    expect(endedDate).toBeInTheDocument();
    expect(addQuestionButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('create question when click "+" button', async () => {
    setUp();

    const addQuestionButton = screen.getByTestId('addQuestion');

    // 1) create question
    fireEvent.click(addQuestionButton);
    const createdQuestion = await screen.findByTestId('question');

    // 2) check question is on screen
    expect(createdQuestion).toBeInTheDocument();
  });

  it('delete question when click "🗑️" button', async () => {
    setUp();

    // 1) create question
    const addQuestionButton = screen.getByTestId('addQuestion');
    fireEvent.click(addQuestionButton);

    // 2) delete question
    const deleteQuestionButton = await screen.findByTestId('deleteQuestion');
    fireEvent.click(deleteQuestionButton);
    const deletedQuestion = screen.queryByTestId('question');

    // 3) check question is not on screen
    expect(deletedQuestion).not.toBeInTheDocument();
  });

  it('create and delete from the middle of the questions', async () => {
    setUp();

    // 1) create 5 questions
    const addQuestionButton = screen.getByTestId('addQuestion');
    fireEvent.click(addQuestionButton);
    fireEvent.click(addQuestionButton);
    fireEvent.click(addQuestionButton);
    fireEvent.click(addQuestionButton);
    fireEvent.click(addQuestionButton);

    const addQuestionButtons = await screen.findAllByTestId('addQuestion');
    const deleteQuestionButtons = await screen.findAllByTestId('deleteQuestion');
    const questionTitles = await screen.findAllByDisplayValue('설문 제목');

    // 2) set question title as index for distinction
    questionTitles.forEach((questionTitle, index) => {
      fireEvent.change(questionTitle, { target: { value: index } });
    });
    expect((questionTitles[2] as HTMLInputElement).value === '2');

    // 3) delete question in index 2
    fireEvent.click(deleteQuestionButtons[2]);
    expect((questionTitles[2] as HTMLInputElement).value === '3');

    // 4) add question under index 1
    fireEvent.click(addQuestionButtons[1 + 1]);
    expect((questionTitles[2] as HTMLInputElement).value === '설문 제목');
  });

  it('check initial question type is LONG_ANSWER', async () => {
    setUp();

    // 1) create question
    const addQuestionButton = screen.getByTestId('addQuestion');
    fireEvent.click(addQuestionButton);

    // 2) check label of question
    const label = await screen.findByText('장문형 답변이 입력돼요.');
    expect(label).toBeInTheDocument();
  });

  it('change question type to SHORT_ANSWER', async () => {
    setUp();

    // 1) create question
    const addQuestionButton = screen.getByTestId('addQuestion');
    fireEvent.click(addQuestionButton);

    // 2) change question type
    const questionSelector = await screen.findByTestId('selector');
    fireEvent.change(questionSelector, { target: { value: QuestionType.SHORT_ANSWER } });

    // 3) check label of question
    const label = await screen.findByText('단답형 답변이 입력돼요.');
    expect(label).toBeInTheDocument();
  });

  it('change question type to SINGLE_CHOICE', async () => {
    setUp();

    // 1) create question
    const addQuestionButton = screen.getByTestId('addQuestion');
    fireEvent.click(addQuestionButton);

    // 2) change question type
    const questionSelector = await screen.findByTestId('selector');
    fireEvent.change(questionSelector, { target: { value: QuestionType.SINGLE_CHOICE } });

    // 3) check label of question
    const label = await screen.findByText('문항을 추가해 주세요');
    expect(label).toBeInTheDocument();
  });

  it('change question type to MULTIPLE_CHOICE', async () => {
    setUp();

    // 1) create question
    const addQuestionButton = screen.getByTestId('addQuestion');
    fireEvent.click(addQuestionButton);

    // 2) change question type
    const questionSelector = await screen.findByTestId('selector');
    fireEvent.change(questionSelector, { target: { value: QuestionType.MULTIPLE_CHOICES } });

    // 3) check label of question
    const label = await screen.findByText('문항을 추가해 주세요');
    expect(label).toBeInTheDocument();
  });

  it('add option when click "문항 추가하기" button', async () => {
    setUp();

    // 1) create question
    const addQuestionButton = screen.getByTestId('addQuestion');
    fireEvent.click(addQuestionButton);

    // 2) change question type
    const questionSelector = await screen.findByTestId('selector');
    fireEvent.change(questionSelector, { target: { value: QuestionType.MULTIPLE_CHOICES } });

    // 3) add 5 options
    const addOptionButton = screen.getByText('문항 추가하기');
    fireEvent.click(addOptionButton);
    fireEvent.click(addOptionButton);
    fireEvent.click(addOptionButton);
    fireEvent.click(addOptionButton);
    fireEvent.click(addOptionButton);

    // 4) check 5 options are on screen
    const options = await screen.findAllByPlaceholderText('문항을 입력해 주세요');
    expect(options.length === 5);
  });

  it('delete option when click "X" button', async () => {
    setUp();

    // 1) create question
    const addQuestionButton = screen.getByTestId('addQuestion');
    fireEvent.click(addQuestionButton);

    // 2) change question type
    const questionSelector = await screen.findByTestId('selector');
    fireEvent.change(questionSelector, { target: { value: QuestionType.MULTIPLE_CHOICES } });

    // 3) add 5 options
    const addOptionButton = screen.getByText('문항 추가하기');
    fireEvent.click(addOptionButton);
    fireEvent.click(addOptionButton);
    fireEvent.click(addOptionButton);
    fireEvent.click(addOptionButton);
    fireEvent.click(addOptionButton);

    const options = await screen.findAllByPlaceholderText('문항을 입력해 주세요');
    const deleteOptionButtons = await screen.findAllByTestId('deleteOption');

    // 4) set option as index for distinction
    options.forEach((option, index) => {
      fireEvent.change(option, { target: { value: index } });
    });
    expect((options[2] as HTMLInputElement).value === '2');

    // 5) delete option in index 2
    fireEvent.click(deleteOptionButtons[2]);
    expect((options[2] as HTMLInputElement).value === '3');
  });

  it('show modal when survey title, description, startedDate and endedDate is empty', async () => {
    setUp();

    const surveyTitle = screen.getByPlaceholderText('설문지의 제목을 입력해주세요');
    const startedDate = screen.getByLabelText('시작일 :');
    const endedDate = screen.getByLabelText('종료일 :');
    const surveyDescription = screen.getByPlaceholderText('설문지의 설명을 입력해주세요');
    const submitButton = screen.getByText('제출하기');

    // initial startedDate and endedDate is empty
    // 1) check modal is open
    fireEvent.click(submitButton);
    let emptyInputModal = await screen.findByText('모든 입력을 채워 주세요.');
    expect(emptyInputModal).toBeInTheDocument();

    // 2) close modal
    let okButton = await screen.findByText('확인');
    fireEvent.click(okButton);
    expect(emptyInputModal).not.toBeInTheDocument();

    // 3) put input on staredDate and enededDate
    fireEvent.change(startedDate, { target: { value: '9999-12-12 11:11' } });
    fireEvent.change(endedDate, { target: { value: '9999-12-12 11:12' } });

    // 4) remove input of survey title
    fireEvent.change(surveyTitle, { target: { value: '' } });

    // 5) check modal is open
    fireEvent.click(submitButton);
    emptyInputModal = await screen.findByText('모든 입력을 채워 주세요.');
    expect(emptyInputModal).toBeInTheDocument();

    // 6) close modal
    okButton = await screen.findByText('확인');
    fireEvent.click(okButton);
    expect(emptyInputModal).not.toBeInTheDocument();

    // 7) put input on survey title
    fireEvent.change(surveyTitle, { target: { value: 'aaaa' } });

    // 8) remove input of survey description
    fireEvent.change(surveyDescription, { target: { value: '' } });

    // 9) check modal is open
    fireEvent.click(submitButton);
    emptyInputModal = await screen.findByText('모든 입력을 채워 주세요.');
    expect(emptyInputModal).toBeInTheDocument();
  });

  it('show modal when startedDate is early', async () => {
    setUp();

    const startedDate = screen.getByLabelText('시작일 :');
    const endedDate = screen.getByLabelText('종료일 :');
    const submitButton = screen.getByText('제출하기');
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dates = date.getDate();
    const hour = date.getHours();
    let minute = date.getMinutes();

    // 1) put input on early staredDate and enededDate
    minute -= 1;
    fireEvent.change(startedDate, {
      target: {
        value: `${year}-${month >= 10 ? month : `0${month}`}-${dates >= 10 ? dates : `0${dates}`} ${
          hour >= 10 ? hour : `0${hour}`
        }:${minute >= 10 ? minute : `0${minute}`}`,
      },
    });
    fireEvent.change(endedDate, { target: { value: '9999-12-12 16:12' } });

    // 2) check modal is open
    fireEvent.click(submitButton);
    const wrongDateModal = await screen.findByText('설문조사 시작일은 현재 시각 이후부터 가능해요.');
    expect(wrongDateModal).toBeInTheDocument();
  });

  it('show modal when endedDate is early', async () => {
    setUp();

    const startedDate = screen.getByLabelText('시작일 :');
    const endedDate = screen.getByLabelText('종료일 :');
    const submitButton = screen.getByText('제출하기');

    // 1) put input on staredDate and early endedDate
    fireEvent.change(startedDate, { target: { value: '9999-12-12 11:13:00' } });
    fireEvent.change(endedDate, { target: { value: '9999-12-12 11:12:59' } });

    // 2) check modal is open
    fireEvent.click(submitButton);
    let wrongDateModal = await screen.findByText('설문조사 종료일이 시작일과 같거나 빨라요.');
    expect(wrongDateModal).toBeInTheDocument();

    // 3) put input on not enough endedDate
    fireEvent.change(endedDate, { target: { value: '9999-12-12 11:13:59' } });

    // 4) check modal is open
    fireEvent.click(submitButton);
    wrongDateModal = await screen.findByText('설문조사 종료일이 시작일과 같거나 빨라요.');
    expect(wrongDateModal).toBeInTheDocument();
  });

  it('show modal when survey has no questions', async () => {
    setUp();

    const startedDate = screen.getByLabelText('시작일 :');
    const endedDate = screen.getByLabelText('종료일 :');
    const submitButton = screen.getByText('제출하기');

    // 1) put input on staredDate and endedDate
    fireEvent.change(startedDate, { target: { value: '9999-12-12 11:11' } });
    fireEvent.change(endedDate, { target: { value: '9999-12-12 11:12' } });

    // 2) check modal is open
    fireEvent.click(submitButton);
    const noQuestionModal = await screen.findByText('하나 이상의 질문을 추가해 주세요.');
    expect(noQuestionModal).toBeInTheDocument();
  });

  it('show modal when question title and description is empty', async () => {
    setUp();

    const startedDate = screen.getByLabelText('시작일 :');
    const endedDate = screen.getByLabelText('종료일 :');
    const addQuestionButton = screen.getByTestId('addQuestion');
    const submitButton = screen.getByText('제출하기');

    // 1) put input on staredDate and endedDate
    fireEvent.change(startedDate, { target: { value: '9999-12-12 11:11' } });
    fireEvent.change(endedDate, { target: { value: '9999-12-12 11:12' } });

    // 2) add question
    fireEvent.click(addQuestionButton);

    const questionTitle = screen.getByPlaceholderText('설문의 제목을 입력해주세요');
    const questionDescription = screen.getByPlaceholderText('설문의 설명을 입력해주세요');

    // 3) remove input of question title
    fireEvent.change(questionTitle, { target: { value: '' } });

    // 4) check modal is open
    fireEvent.click(submitButton);
    let emptyInputModal = await screen.findByText('모든 입력을 채워 주세요.');
    expect(emptyInputModal).toBeInTheDocument();

    // 5) close modal
    const okButton = await screen.findByText('확인');
    fireEvent.click(okButton);
    expect(emptyInputModal).not.toBeInTheDocument();

    // 6) put input on question title
    fireEvent.change(questionTitle, { target: { value: 'aaa' } });

    // 7) remove input of question description
    fireEvent.change(questionDescription, { target: { value: '' } });

    // 8) check modal is open
    fireEvent.click(submitButton);
    emptyInputModal = await screen.findByText('모든 입력을 채워 주세요.');
    expect(emptyInputModal).toBeInTheDocument();
  });

  it('show modal when selective question has no option', async () => {
    setUp();

    const startedDate = screen.getByLabelText('시작일 :');
    const endedDate = screen.getByLabelText('종료일 :');
    const addQuestionButton = screen.getByTestId('addQuestion');
    const submitButton = screen.getByText('제출하기');

    // 1) put input on staredDate and endedDate
    fireEvent.change(startedDate, { target: { value: '9999-12-12 11:11' } });
    fireEvent.change(endedDate, { target: { value: '9999-12-12 11:12' } });

    // 2) add question
    fireEvent.click(addQuestionButton);

    // 3) change question type
    const questionSelector = await screen.findByTestId('selector');
    fireEvent.change(questionSelector, { target: { value: QuestionType.MULTIPLE_CHOICES } });

    // 4) check modal is open
    fireEvent.click(submitButton);
    const emptyInputModal = await screen.findByText('객관식 문항을 추가해 주세요.');
    expect(emptyInputModal).toBeInTheDocument();
  });

  it('show modal when option is empty', async () => {
    setUp();

    const startedDate = screen.getByLabelText('시작일 :');
    const endedDate = screen.getByLabelText('종료일 :');
    const addQuestionButton = screen.getByTestId('addQuestion');
    const submitButton = screen.getByText('제출하기');

    // 1) put input on staredDate and endedDate
    fireEvent.change(startedDate, { target: { value: '9999-12-12 11:11' } });
    fireEvent.change(endedDate, { target: { value: '9999-12-12 11:12' } });

    // 2) add question
    fireEvent.click(addQuestionButton);

    // 3) change question type
    const questionSelector = await screen.findByTestId('selector');
    fireEvent.change(questionSelector, { target: { value: QuestionType.MULTIPLE_CHOICES } });

    // 4) add option
    const addOptionButton = screen.getByText('문항 추가하기');
    fireEvent.click(addOptionButton);

    // 5) remove input of option
    const option = await screen.findByPlaceholderText('문항을 입력해 주세요');
    fireEvent.change(option, { target: { value: '' } });

    // 6) check modal is open
    fireEvent.click(submitButton);
    const emptyInputModal = await screen.findByText('모든 입력을 채워 주세요.');
    expect(emptyInputModal).toBeInTheDocument();
  });
  // TODO: limit on number of questions and options
});
