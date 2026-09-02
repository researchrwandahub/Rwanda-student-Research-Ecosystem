"""Non-destructive RSJH -> Research Passport integration."""
from rsre_core.services import record_passport_evidence


def record_manuscript_submission(article):
    return record_passport_evidence(
        article.author, "publication", f"RSJH manuscript submitted: {article.title}",
        "A manuscript was successfully submitted to the Rwanda Student Journal for Health.",
        "journal.article", article.pk, metadata={"journal":"RSJH","event":"submitted"},
    )


def record_peer_review(review):
    return record_passport_evidence(
        review.reviewer, "review", f"RSJH peer review completed: {review.article.title}",
        "A peer review was successfully completed for an RSJH manuscript.",
        "journal.review", review.pk, metadata={"journal":"RSJH","event":"review_completed"},
    )


def record_publication(article):
    return record_passport_evidence(
        article.author, "publication", f"RSJH publication: {article.title}",
        "A manuscript reached publication in RSJH and was recorded as research evidence.",
        "journal.article.publication", article.pk, metadata={
            "journal":"RSJH","event":"published","doi":article.doi,
            "publication_number":article.publication_number,"volume":article.volume,"issue":article.issue,
        },
    )
