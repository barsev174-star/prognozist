from app.services.scoring import SCORE_EXACT_POINTS, SCORE_OUTCOME_POINTS, score_prediction, score_yes_no_answer


def test_exact_score_awards_10_points_only() -> None:
    result = score_prediction(2, 1, 2, 1)

    assert result.points == SCORE_EXACT_POINTS
    assert result.is_exact_score is True
    assert result.is_outcome_correct is True


def test_correct_winner_awards_3_points() -> None:
    result = score_prediction(1, 0, 3, 1)

    assert result.points == SCORE_OUTCOME_POINTS
    assert result.is_exact_score is False
    assert result.is_outcome_correct is True


def test_correct_draw_outcome_awards_3_points() -> None:
    result = score_prediction(1, 1, 2, 2)

    assert result.points == SCORE_OUTCOME_POINTS
    assert result.is_exact_score is False
    assert result.is_outcome_correct is True


def test_wrong_outcome_awards_0_points() -> None:
    result = score_prediction(1, 0, 0, 2)

    assert result.points == 0
    assert result.is_exact_score is False
    assert result.is_outcome_correct is False


def test_public_or_vip_correct_answer_awards_configured_points() -> None:
    assert score_yes_no_answer(answer=True, correct_answer=True, points=3) == 3


def test_public_or_vip_wrong_answer_awards_0_points() -> None:
    assert score_yes_no_answer(answer=False, correct_answer=True, points=3) == 0

